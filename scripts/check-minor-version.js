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

console.log("Current expected minor version is: " + expectedMinorVersion);
console.log("Minor version is: " + minorVersion);
console.log("Good to go!");
