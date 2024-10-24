import * as OpenAPI from "fumadocs-openapi";
import { fileURLToPath } from "node:url";
import { rimrafSync } from "rimraf";

const out = "./src/content/docs/cloud/api";

// clean generated files
rimrafSync(out, {
  filter(v) {
    return !v.endsWith("index.mdx") && !v.endsWith("meta.json");
  },
});

void OpenAPI.generateFiles({
  input: [
    fileURLToPath(
      new URL("../../../packages/cloud/openapi.json", import.meta.url),
    ),
  ],
  output: out,
  groupBy: "tag",
});
