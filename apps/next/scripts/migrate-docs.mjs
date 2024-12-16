/**
 * This script is used to migrate the docs from the old format to the new format.
 * It will rename all .md files to .mdx and add frontmatter to the top of the file.
 * It will also update all links to the correct format.
 * It's run in local only to reduce time mannually copying the docs.
 * After running the script, you also need to manually fix some contents (e.g: update CodeBlock, CodeSource, etc.)
 */

import { generateFiles } from "fumadocs-typescript";
import * as path from "node:path";

const out = "./src/content/docs/llamaindex";

void generateFiles({
  input: ["../docs/docs/modules/**/*.md", "../docs/docs/modules/**/*.mdx"],
  output: (file) =>
    path.resolve(
      path.join(out, path.dirname(file).replace("../docs/docs/", "")),
      `${path.basename(file).split(".")[0]}.mdx`, // rename .md to .mdx
    ),
  transformOutput,
});

// Replace h1 title with frontmatter title, update all links
// Example: # LLM -> --- title: LLM ---
function transformOutput(filePath, content) {
  const lines = content.split("\n");
  const h1Index = lines.findIndex((line) => /^# /.test(line));
  const title = lines[h1Index].replace("# ", "").trim();
  const mdxLines = [
    `---`,
    `title: ${title}`,
    `---`,
    ...lines.slice(h1Index + 1),
  ];
  const mdxContent = mdxLines.join("\n");

  // update all links, remove .md and replace ../../api (or ../api, ./api, ...) with /docs/api
  // eg: [SentenceSplitter](../api/classes/SentenceSplitter.md) -> [SentenceSplitter](/docs/api/classes/SentenceSplitter)
  const result = mdxContent.replace(
    /\]\((\.{0,2}\/)*api\/([^)]+)\.md([^)]*)\)/g,
    (match, prefix, path, anchor) => {
      return `](/docs/api/${path}${anchor})`;
    },
  );

  return result;
}
