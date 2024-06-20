import { readFile, writeFile } from "node:fs/promises";

const packages = ["llamaindex", "env"];
const envPackageJson = JSON.parse(
  await readFile("./packages/env/package.json", "utf8"),
);
for (const pkg of packages) {
  const { packageJson, jsrJson } = await Promise.all([
    readFile(`./packages/${pkg}/package.json`, "utf8"),
    readFile(`./packages/${pkg}/jsr.json`, "utf8"),
  ]).then(([packageJson, jsrJson]) => {
    return {
      packageJson: JSON.parse(packageJson),
      jsrJson: JSON.parse(jsrJson),
    };
  });

  jsrJson.version = packageJson.version;
  if (pkg === "llamaindex") {
    jsrJson.imports["@llamaindex/env"] =
      `jsr:@llamaindex/env@${envPackageJson.version}`;
  }

  await writeFile(
    `./packages/${pkg}/jsr.json`,
    JSON.stringify(jsrJson, null, 2) + "\n",
  );
}

console.log("Good to go!");
