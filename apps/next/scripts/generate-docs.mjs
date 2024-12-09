import * as OpenAPI from "fumadocs-openapi";
import { generateFiles } from "fumadocs-typescript";
import fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { rimrafSync } from "rimraf";

const out = "./src/content/docs/cloud/api";
const apiRefOut = "./src/content/docs/api";

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

// append title at the top of the file and remove .mdx from links
function transformOutput(filePath, content) {
  const fileName = path.basename(filePath);
  let title = fileName.split(".")[0];
  if (title === "index") title = "LlamaIndex API Reference";

  // Replace .mdx links with the correct format
  content = content
    // Handle relative paths starting with ../
    .replace(/\((\.\.\/[^)]+)\.mdx\)/g, (match, path) => {
      return `(/docs/api${path.substring(2)})`;
    })
    // Handle links in the same directory (without ../)
    .replace(/\(([^/)][^)]+)\.mdx\)/g, (match, path) => {
      return `(/docs/api/classes/${path})`;
    });

  return `---\ntitle: ${title}\n---\n\n${content}`;
}

// append meta.json for API page
fs.writeFileSync(
  path.resolve(apiRefOut, "meta.json"),
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
