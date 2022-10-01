import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, test } from '@jest/globals';
import { watchDirectoryForTransactions } from "./filewatcher";

describe("Filewatcher", () => {
    test("Should end when a file is created", () => {
        const directory = tmpdir();

        return Promise.all([
            watchDirectoryForTransactions(directory)
            .then(result => 
                expect(result).toBe([])),
            new Promise(resolve => fs.writeFile(directory + '/test.csv', '', resolve))
        ]);
    });
});
