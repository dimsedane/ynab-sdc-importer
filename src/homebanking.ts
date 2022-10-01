import * as puppeteer from "puppeteer-core";
import cssesc from "cssesc";
import { Configuration } from "./config";
import { Transaction, watchDirectoryForTransactions } from "./filewatcher";

export async function openHomebanking(browser: puppeteer.Browser, config: Configuration) {
  const page = await browser.newPage();
  await page.goto(config.homebankingUrl);

  // Handle Login
  await page.evaluate('CookieInformation.declineAllCategories()');
  await page.click("a[data-test-login-button=MitID]");

  return page;
}

export async function getHomebankingData(page: puppeteer.Page, accountName: string, config: Configuration): Promise<Transaction[]> {
  await page.waitForSelector(`tr[title="${cssesc(accountName)}"]`, {
    timeout: 2 * 60 * 1000
  });
  await page.click(`tr[title="${cssesc(accountName)}"]`);

  await page.waitForSelector("button.account-header-actions__export-button");
  await delay(2000);
  await page.click("button.account-header-actions__export-button");

  await page.waitForSelector("div.export-manager");
  await delay(2000);

  let button;
  while (!button) {
    [button] = await page.$x("//button[contains(., 'Eksporter i CSV')]");

    await delay(500);
  }

  const [transactions] = await Promise.all([
    watchDirectoryForTransactions(config.downloadsFolder),
    button.click(),
  ]);

  await page.goto(config.homebankingUrl);

  return transactions;
}

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
