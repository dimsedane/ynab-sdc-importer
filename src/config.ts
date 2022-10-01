import * as fs from "node:fs";

interface AccountConfiguration {
    bankName: string,
    ynabId: string
  }
  
  export interface Configuration {
    ynabAccessToken: string,
    budgetId: string,
    downloadsFolder: string,
    homebankingUrl: string,
    accounts: AccountConfiguration[]
  }

  export function loadConfiguration() : Configuration {
    // Setup all the configuration
    const configContents = fs.readFileSync('configuration.json');
   return JSON.parse(configContents.toString()) as Configuration;
  }