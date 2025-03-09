import { generateFiles as openapiGenerateFiles } from "fumadocs-openapi";
import { generateFiles as typescriptGenerateFiles } from "fumadocs-typescript";
import fs from "node:fs";
import * as path from "node:path";
import { rimrafSync } from "rimraf";

const out = "./src/content/docs/cloud/api";
const apiRefOut = "./src/content/docs/api";

// clean generated files
rimrafSync(out, {
  filter(v) {
    return !v.endsWith("index.mdx") && !v.endsWith("meta.json");
  },
});

void openapiGenerateFiles({
  input: ["../../packages/cloud/openapi.json"],
  output: "./src/content/docs/cloud/api",
  groupBy: "tag",
});

void typescriptGenerateFiles({
  input: ["./src/content/docs/api/**/*.mdx"],
  output: (file) => path.resolve(path.dirname(file), path.basename(file)),
  transformOutput,
});

function transformOutput(filePath: string, content: string) {
  const fileName = path.basename(filePath);
  let title = fileName.split(".")[0];
  if (title === "index") title = "LlamaIndex API Reference";
  return `---\ntitle: ${title}\n---\n\n${transformAbsoluteUrl(content, filePath)}`;
}

/**
 * Transforms the content by converting relative MDX links to absolute docs API links
 * Example: [text](../type-aliases/TaskHandler.mdx) -> [text](/docs/api/type-aliases/TaskHandler)
 * [text](BaseChatEngine.mdx) -> [text](/docs/api/classes/BaseChatEngine)
 * [text](BaseVectorStore.mdx#constructors) -> [text](/docs/api/classes/BaseVectorStore#constructors)
 * [text](TaskStep.mdx) -> [text](/docs/api/type-aliases/TaskStep)
 */
function transformAbsoluteUrl(content: string, filePath: string) {
  const group = path.dirname(filePath).split(path.sep).pop();
  return content.replace(/\]\(([^)]+)\.mdx([^)]*)\)/g, (_, slug, anchor) => {
    const slugParts = slug.split("/");
    const fileName = slugParts[slugParts.length - 1];
    const fileGroup = slugParts[slugParts.length - 2] ?? group;
    const result = ["/docs/api", fileGroup, fileName, anchor]
      .filter(Boolean)
      .join("/");
    return `](${result})`;
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
