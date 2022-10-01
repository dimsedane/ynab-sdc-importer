import * as fs from "node:fs";
import { parse } from "@fast-csv/parse";
import * as ynab from "ynab";

export interface Transaction {
    date: string,
    memo: string,
    amount: number
}

export function watchDirectoryForTransactions(directory: string) : Promise<Transaction[]> {
    if(!directory.endsWith('/')) {
        directory = directory + '/'
    }

    return new Promise<Transaction[]>(resolve => {
        const watcher = fs.watch(directory, (event, filename) => {
            console.log(`Saw the event ${event} for the file ${filename}`);

            if (filename.endsWith(".csv")) {
                const data: Transaction[] = [];
                fs.createReadStream(directory + filename)
                .pipe(parse({delimiter: ";"}))
                .on('error', error => console.error(error))
                .on('data', row => {
                    // We need to change the date format to the same iso format that YNAB is using
                    const dateParts = row[0].split('-');
                    const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

                    data.push({
                        date: isoDate,
                        memo: row[1],
                        amount: Math.round(parseFloat(row[2].replace('.','').replace(',','.')) * 1000)
                    });
                })
                .on('end', () => resolve(data));

                watcher.close();
            }
        });
    });
}