import {
  createGenerator,
  generateFiles as typescriptGenerateFiles,
} from "fumadocs-typescript";
import fs from "node:fs";
import * as path from "node:path";
import { rimrafSync } from "rimraf";

const generator = createGenerator();
const out = "./src/content/docs/cloud/api";
const apiRefOut = "./src/content/docs/api";

// clean generated files
rimrafSync(out, {
  filter(v) {
    return !v.endsWith("index.md") && !v.endsWith("meta.json");
  },
});

void typescriptGenerateFiles(generator, {
  input: ["./src/content/docs/api/**/*.md"],
  output: (file) => path.resolve(path.dirname(file), path.basename(file)),
  transformOutput,
});

function transformOutput(filePath: string, content: string) {
  const fileName = path.basename(filePath);
  let title = fileName.split(".")[0];
  if (title === "index") title = "LlamaIndex API Reference";
  return `---\ntitle: ${title}\n---\n\n${transformAbsoluteUrl(
    content.replace(/(?<!\\)\{([^}]+)(?<!\\)}/g, "\\{$1\\}"),
    filePath,
  )}`;
}

/**
 * Transforms the content by converting relative MD links to absolute docs API links
 * Example: [text](../type-aliases/TaskHandler.md) -> [text](/docs/api/type-aliases/TaskHandler)
 * [text](BaseChatEngine.md) -> [text](/docs/api/classes/BaseChatEngine)
 * [text](BaseVectorStore.md#constructors) -> [text](/docs/api/classes/BaseVectorStore#constructors)
 * [text](TaskStep.md) -> [text](/docs/api/type-aliases/TaskStep)
 */
function transformAbsoluteUrl(content: string, filePath: string) {
  const group = path.dirname(filePath).split(path.sep).pop();
  return content.replace(/\]\(([^)]+)\.md([^)]*)\)/g, (_, slug, anchor) => {
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
