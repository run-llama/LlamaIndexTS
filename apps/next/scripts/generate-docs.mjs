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

function transformOutput(filePath, content) {
  const fileName = path.basename(filePath);
  let title = fileName.split(".")[0];
  if (title === "index") title = "LlamaIndex API Reference";

  const transformedContent = transformAbsoluteUrl(filePath, content);
  return `---\ntitle: ${title}\n---\n\n${transformedContent}`;
}

/**
 * Transforms the content by converting relative MDX links to absolute docs API links
 * Example: [text](../type-aliases/TaskHandler.mdx) -> [text](/docs/api/type-aliases/TaskHandler)
 */
function transformAbsoluteUrl(filePath, content) {
  const currentFileDir = path.dirname(filePath);
  return content.replace(/\(([^)]+)\.mdx([^)]*)\)/g, (match, slug, anchor) => {
    const absolutePath = path.resolve(currentFileDir, `${slug}.mdx`);
    const index = absolutePath.indexOf(["docs", "api"].join(path.sep));
    const result = `(/${absolutePath
      .slice(index)
      .replace(".mdx", "")
      .split(path.sep)
      .join("/")
      .replace(/\/index$/, "")}${anchor || ""})`;
    return result;
  });
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
