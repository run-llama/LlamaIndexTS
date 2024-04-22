// Copies the dependencies from the core package to the edge package. Run with each build to ensure that they are the same

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const corePackagePath = path.join(process.cwd(), "..", "core", "package.json");
const edgePackagePath = path.join(process.cwd(), "package.json");

const edgePackage = readJson(edgePackagePath);
const corePackage = readJson(corePackagePath);
edgePackage.dependencies = corePackage.dependencies;
edgePackage.devDependencies = corePackage.devDependencies;
edgePackage.peerDependencies = corePackage.peerDependencies;
edgePackage.version = corePackage.version;
writeJson(edgePackagePath, edgePackage);
execSync("pnpm install --lockfile-only", { stdio: "inherit" });

function readJson(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function writeJson(filePath, json) {
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n");
}
