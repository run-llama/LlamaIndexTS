const fs = require("fs");

const packageJson = JSON.parse(
  fs.readFileSync("./packages/core/package.json", "utf8"),
);

const versions = packageJson.version.split(".");
const minorVersion = packageJson.version.split(".")[1];
const expectedMinorVersion = packageJson.expectedMinorVersion;

if (versions.length !== 3) {
  console.error(
    "Version must be in format x.y.z but is " + packageJson.version,
  );
  process.exit(1);
}

if (minorVersion !== expectedMinorVersion) {
  console.error(
    "Minor version must be " +
      expectedMinorVersion +
      " but is " +
      minorVersion +
      ". Please adjust that on the packages/core/package.json.",
  );
  process.exit(1);
}

const packages = ["env", "core"];
const envPackageJson = JSON.parse(
  fs.readFileSync("./packages/env/package.json", "utf8"),
);
for (const pkg of packages) {
  const packageJson = JSON.parse(
    fs.readFileSync(`./packages/${pkg}/package.json`, "utf8"),
  );
  const jsrJson = JSON.parse(
    fs.readFileSync(`./packages/${pkg}/jsr.json`, "utf8"),
  );

  jsrJson.version = packageJson.version;
  if (pkg === "core") {
    jsrJson.imports["@llamaindex/env"] =
      `jsr:@llamaindex/env@${envPackageJson.version}`;
  }

  fs.writeFileSync(
    `./packages/${pkg}/jsr.json`,
    JSON.stringify(jsrJson, null, 2) + "\n",
  );
}

console.log("Current expected minor version is: " + expectedMinorVersion);
console.log("Minor version is: " + minorVersion);
console.log("Good to go!");
