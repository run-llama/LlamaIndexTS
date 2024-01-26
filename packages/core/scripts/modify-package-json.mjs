#!/usr/bin/env node
/**
 * This script is used to modify the package.json file in the dist folder
 * so that it can be published to npm.
 */
import editJsonFile from "edit-json-file";
import fs from "node:fs/promises";
await fs.copyFile("./package.json", "./dist/package.json");
const file = editJsonFile("./dist/package.json");

file.unset("scripts");
file.unset("private");
await new Promise((resolve) => file.save(resolve));
