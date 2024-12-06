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

// append title at the top of the file
function transformOutput(file, content) {
  const fileName = path.basename(file);
  let title = fileName.split(".")[0];
  if (title === "index") title = "LlamaIndex API Reference";

  // remove .mdx extension in content
  // TODO: should have a option in typedoc to strip extension
  const contentWithoutExtension = content.replaceAll(/\.mdx$/, "");
  return `---\ntitle: ${title}\n---\n\n${contentWithoutExtension}`;
}

// append meta.json for API page
fs.writeFileSync(
  path.resolve("./src/content/docs/api/meta.json"),
  JSON.stringify(
    {
      title: "API Reference",
      description: "LlamaIndex API Reference",
      root: true,
      pages: [
        "index",
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
