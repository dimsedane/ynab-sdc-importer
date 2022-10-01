import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, test } from '@jest/globals';
import { watchDirectoryForTransactions, Transaction } from "./filewatcher";

describe("Filewatcher", () => {
    test("Should end when a file is created", () => {
        const directory = tmpdir();

        return Promise.all([
            watchDirectoryForTransactions(directory)
            .then(result => 
                expect(result).toEqual([])),
            new Promise(resolve => fs.writeFile(directory + '/test.csv', '', resolve))
        ]);
    });

    test("Should parse an SDC formatet CSV file", () => {
        const directory = tmpdir();

        const expected: Transaction[] = [
            {
                date: "2022-09-30",
                memo: "Opsparing",
                amount: -1500000
            },
            {
                date: "2022-09-30",
                memo: "Mad",
                amount: -5000000
            }
        ];

        return Promise.all([
            watchDirectoryForTransactions(directory)
            .then(result => 
                expect(result).toEqual(expected)),
            new Promise(resolve => fs.writeFile(directory + '/test.csv', '30-09-2022;Opsparing;-1.500,00;-26.011,44;DKK\n30-09-2022;Mad;-5.000,00;-24.511,44;DKK', resolve))
        ]);
    });
});
