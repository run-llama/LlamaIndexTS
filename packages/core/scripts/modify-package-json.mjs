#!/usr/bin/env node
/**
 * This script is used to modify the package.json file in the dist folder
 * so that it can be published to npm.
 */
import editJsonFile from "edit-json-file";
import fs from "node:fs/promises";

{
  await fs.copyFile("./package.json", "./dist/package.json");
  const file = editJsonFile("./dist/package.json");

  file.unset("scripts");
  file.unset("private");
  await new Promise((resolve) => file.save(resolve));
}
{
  const packageJson = await fs.readFile("./dist/package.json", "utf8");
  const modifiedPackageJson = packageJson.replaceAll("./dist/", "./");
  await fs.writeFile(
    "./dist/package.json",
    JSON.stringify(JSON.parse(modifiedPackageJson), null, 2),
    "utf8",
  );
}
