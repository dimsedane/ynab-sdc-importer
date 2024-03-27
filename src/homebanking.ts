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
  await delay(1000);
  await page.click(`tr[title="${cssesc(accountName)}"]`);
  await delay(2000);

  // They broke the export, now we must first select all, then export.....
  await page.waitForSelector('div.transaction-list-body div.transaction-field--bulk-select input[type=checkbox]')
  await delay(1000);
  await page.click('div.transaction-list-body div.transaction-field--bulk-select input[type=checkbox]');
  
  await page.waitForSelector('li.transaction-list__bulk-export-action > button')
  await page.click('li.transaction-list__bulk-export-action > button');

  await page.waitForSelector("div.export-manager");
  await delay(2000);

  let button;
  while (!button) {
    [button] = await page.$x("//button[contains(., 'Eksporter i CSV')]");
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
