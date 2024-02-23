#!/usr/bin/env node
/**
 * This script is used to modify the package.json file in the dist folder
 * so that it can be published to npm.
 */
import editJsonFile from "edit-json-file";
import { glob } from "glob";
import fs from "node:fs/promises";
import { relative } from "node:path";

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

{
  const envFileTarget = "./dist/cjs/env/index.js";
  const files = await glob("./dist/cjs/**/*.js");
  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf8");
    const r = relative(filePath, envFileTarget).replace("../", "./");
    const replacedContent = content.replaceAll(
      'require("#llamaindex/env")',
      `require("${r}")`,
    );
    await fs.writeFile(filePath, replacedContent, "utf8");
  }
}

const esmModule = {
  type: "commonjs",
};
{
  await fs.writeFile(
    "./dist/cjs/package.json",
    JSON.stringify(esmModule, null, 2),
    "utf8",
  );
}
