const fs = require("fs");
const path = require("path");

const corePackage = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "packages", "core", "package.json"),
    "utf8",
  ),
);
const packageJsonPath = path.join(
  __dirname,
  "..",
  "packages",
  "edge",
  "package.json",
);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
packageJson.version = corePackage.version;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
