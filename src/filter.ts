import { Transaction } from "./filewatcher";
import * as ynab from "ynab"

export function prepareTransactions(foundTransactions: Transaction[], existingTransactions: ynab.TransactionDetail[], accountId: string): ynab.SaveTransaction[] {
    const result: ynab.SaveTransaction[] = [];

    for (let index = 0; index < foundTransactions.length; index++) {
        const transaction = foundTransactions[index];

        // If the transaction already is in ynab, skip it
        if (existingTransactions.some(t => {
            return t.date === transaction.date &&
                t.memo.trim() == transaction.memo.trim() &&
                t.amount == transaction.amount
        })) {
            console.log(`Skipping transaction for date ${transaction.date} with text ${transaction.memo}`);
            continue;
        }

        result.push({
            ...transaction,
            account_id: accountId
        });
    }

    return result;
}