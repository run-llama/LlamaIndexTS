#!/usr/bin/env node
import fs from "node:fs/promises";

const cjsModule = {
  type: "commonjs",
};
{
  // set the nearest package.json to the cjs module
  // Refs: https://nodejs.org/docs/latest-v20.x/api/packages.html#type
  await fs.writeFile(
    "./dist/cjs/package.json",
    JSON.stringify(cjsModule, null, 2),
    "utf8",
  );
}
