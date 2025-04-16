import fg from "fast-glob";
import { fileGenerator, remarkDocGen, remarkInstall } from "fumadocs-docgen";
import { remarkInclude } from "fumadocs-mdx/config";
import { remarkAutoTypeTable } from "fumadocs-typescript";
import matter from "gray-matter";
import * as fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

export const revalidate = false;

export async function GET() {
  const files = await fg(["./src/content/docs/**/*.mdx"]);

  const scan = files.map(async (file) => {
    const fileContent = await fs.readFile(file);
    const { content, data } = matter(fileContent.toString());

    const dir = path.dirname(file).split(path.sep).at(4);
    const category = {
      llamaindex: "LlamaIndexTS Framework",
      api: "LlamaIndexTS API",
      cloud: "LlamaCloud Service",
    }[dir ?? ""];

    const processed = await processContent(file, content);
    return `file: ${file}
# ${category}: ${data.title}

${data.description}
        
${processed}`;
  });

  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"));
}

async function processContent(path: string, content: string): Promise<string> {
  const file = await remark()
    .use(remarkMdx)
    .use(remarkInclude)
    .use(remarkGfm)
    .use(remarkAutoTypeTable)
    .use(remarkDocGen, { generators: [fileGenerator()] })
    .use(remarkInstall, { persist: { id: "package-manager" } })
    .use(remarkStringify)
    .process({
      path,
      value: content,
    });

  return String(file);
}
