import { upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut } from "@llamaindex/cloud/api";
import fg from "fast-glob";
import {
  fileGenerator,
  remarkDocGen,
  remarkInstall,
  typescriptGenerator,
} from "fumadocs-docgen";
import matter from "gray-matter";
import * as fs from "node:fs/promises";
import path, { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

const baseDir = fileURLToPath(new URL("../src/content", import.meta.url));

async function processContent(content: string): Promise<string> {
  const file = await remark()
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkDocGen, { generators: [typescriptGenerator(), fileGenerator()] })
    .use(remarkInstall, { persist: { id: "package-manager" } })
    .use(remarkStringify)
    .process(content);

  return String(file);
}

export async function updateLlamaCloud(): Promise<void> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;

  const index = process.env.LLAMA_CLOUD_PIPELINE_ID;

  if (!apiKey || !index) {
    console.log("no api key for LlamaCloud found, skipping");
    return;
  }

  const files = await fg([
    "./src/content/docs/**/*.mdx",
    "!./src/content/docs/cloud/api/**/*",
  ]);

  const records: {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string | undefined;
  }[] = [];

  console.log("processing documents for AI");
  const scan = files.map(async (file) => {
    const fileContent = await fs.readFile(file);
    const { content, data } = matter(fileContent.toString());

    const dir = path.dirname(file).split(path.sep).at(3);
    const category = {
      cloud: "LlamaCloud",
      llamaindex: "LlamaIndex.TS",
    }[dir ?? ""];

    if (data._mdx?.mirror) {
      return;
    }

    const processed = await processContent(content);
    const id = relative(baseDir, file);
    records.push({
      id,
      title: data.title as string,
      description: data.description as string,
      content: processed,
      category,
    });
  });

  await Promise.all(scan);

  console.log(`added ${records.length} records`);

  await upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut({
    baseUrl: "https://api.cloud.llamaindex.ai/",
    body: records.map((record) => ({
      id: record.id,
      metadata: {
        title: record.title,
        description: record.description,
        documentUrl: record.id,
        category: record.category,
      },
      text: record.content,
    })),
    path: {
      pipeline_id: index,
    },
    throwOnError: true,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  console.log("done");
}
