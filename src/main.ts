import * as puppeteer from "puppeteer-core";
import * as ynab from "ynab";
import { prepareTransactions } from "./filter";
import { loadConfiguration } from "./config";
import { getHomebankingData, openHomebanking } from "./homebanking";

(async () => {
  try {
    // Setup the configuration
    const configuration = loadConfiguration();
    const ynabAPI = new ynab.API(configuration.ynabAccessToken);

    // Start the browser automation
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--no-sandbox", "--start-maximized"],
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });

    const page = await openHomebanking(browser, configuration);

    for (let i = 0; i < configuration.accounts.length; i += 1) {
      const account = configuration.accounts[i];

      console.log(`Getting transactions for ${account.bankName}`);

      const transactions = await getHomebankingData(page, account.bankName, configuration);

      console.log(`Got ${transactions.length} transactions from the bank`);

      // Get the oldest date in the transaction list, then get all ynab transactions since then
      const oldestTransaction = transactions.reduce((prev, current) => {
        return (prev.date < current.date ? prev : current);
      });

      console.log("Getting transactions from ynab")
      const ynabTransactions = (await ynabAPI.transactions.getTransactionsByAccount(configuration.budgetId, account.ynabId, oldestTransaction.date)).data;

      console.log(`Got ${ynabTransactions.transactions.length} from ynab`);
      const filteredTransactions = prepareTransactions(transactions, ynabTransactions.transactions, account.ynabId);

      console.log(`Left with ${filteredTransactions.length} after filtering for existing`);

      if (filteredTransactions.length > 1)
      await ynabAPI.transactions.createTransactions(configuration.budgetId, {
        transactions: filteredTransactions
      });
    }

    await browser.close();
  } catch (e) {
    console.log(e);
  }
})();

