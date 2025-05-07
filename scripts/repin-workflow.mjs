import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgPath = path.join(
  __dirname,
  "..",
  "packages",
  "llamaindex",
  "package.json",
);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.dependencies["@llamaindex/workflow"] = "1.0.3";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(
  "Re-pinned @llamaindex/workflow to 1.0.3 in llamaindex package.json",
);
