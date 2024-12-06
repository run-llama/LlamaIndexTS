import * as OpenAPI from "fumadocs-openapi";
import { generateFiles } from "fumadocs-typescript";
import fs from "node:fs";
import * as path from "node:path";
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

void generateFiles({
  input: ["./src/content/docs/api/**/*.mdx"],
  output: (file) => path.resolve(path.dirname(file), path.basename(file)),
  transformOutput,
});

// append title, description at the top of the file
function transformOutput(file, content) {
  const fileName = path.basename(file);
  const title = fileName.split(".")[0];
  const description = fileName.split(".")[0];
  return `---\ntitle: ${title}\ndescription: ${description} API Reference\n---\n\n${content}`;
}

// append meta.json for API page
fs.writeFileSync(
  path.resolve("./src/content/docs/api/meta.json"),
  JSON.stringify(
    {
      title: "API Reference",
      description: "API Reference",
      root: true,
      pages: [
        "LlamaIndex",
        "classes",
        "enumerations",
        "functions",
        "interfaces",
        "type-aliases",
        "variables",
      ],
    },
    null,
    2,
  ),
);
