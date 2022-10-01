import * as fs from "node:fs"
import * as ynab from "ynab";
import { watchDirectoryForTransactions } from "./filewatcher";
import { prepareTransactions } from "./filter";

interface AccountConfiguration {
  bankName: string,
  ynabId: string
}

interface Configuration {
  ynabAccessToken: string,
  budgetId: string,
  downloadsFolder: string,
  accounts: AccountConfiguration[]
}

(async () => {
  try {
    const configContents = fs.readFileSync('configuration.json');
    const configuration: Configuration = JSON.parse(configContents.toString());
    const ynabAPI = new ynab.API(configuration.ynabAccessToken);

    for (let i = 0; i < configuration.accounts.length; i += 1) {
      const account = configuration.accounts[i];

      // Get the CSV File somehow
      const transactions = await watchDirectoryForTransactions(configuration.downloadsFolder);

      // Get the oldest date in the transaction list, then get all ynab transactions since then
      const oldestTransaction = transactions.reduce((prev, current) => {
        return (prev.date < current.date ? prev : current);
      });

      const ynabTransactions = (await ynabAPI.transactions.getTransactionsByAccount(configuration.budgetId, account.ynabId, oldestTransaction.date)).data;

      const filteredTransactions = prepareTransactions(transactions, ynabTransactions.transactions, account.ynabId);

      await ynabAPI.transactions.createTransactions(configuration.budgetId, {
        transactions: filteredTransactions
      });
    }
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();

