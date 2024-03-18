import fs from "node:fs";
import path from "node:path";

const corePackage = readJson(
  path.join(process.cwd(), "..", "core", "package.json"),
);
const edgePackage = readJson(path.join(process.cwd(), "package.json"));

if (!equalObjs(corePackage.dependencies, edgePackage.dependencies)) {
  console.log(
    "Dependencies of '@llamaindex/edge' and 'core' package are not the same. Sync dependencies and run build again",
  );
  process.exit(1);
}

function readJson(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function equalObjs(deps1, deps2) {
  const keys1 = Object.keys(deps1);
  const keys2 = Object.keys(deps2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (deps1[key] !== deps2[key]) {
      return false;
    }
  }

  return true;
}
