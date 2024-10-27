import { PipelinesService } from "@llamaindex/cloud/api";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { fileGenerator, remarkDocGen, remarkInstall } from "fumadocs-docgen";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const baseDir = fileURLToPath(new URL("../src/content", import.meta.url));

export const { docs, meta } = defineDocs({
  dir: "./src/content/docs",
});

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    rehypeCodeOptions: {
      inline: "tailing-curly-colon",
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha",
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash(),
        {
          name: "transformers:remove-notation-escape",
          code(hast) {
            for (const line of hast.children) {
              if (line.type !== "element") continue;

              const lastSpan = line.children.findLast(
                (v) => v.type === "element",
              );

              const head = lastSpan?.children[0];
              if (head?.type !== "text") return;

              head.value = head.value.replace(/\[\\!code/g, "[!code");
            }
          },
        },
      ],
    },
    remarkPlugins: [
      remarkMath,
      [remarkInstall, { persist: { id: "package-manager" } }],
      [remarkDocGen, { generators: [fileGenerator()] }],
      () => {
        return (_, file, next) => {
          const metadata = file.data.frontmatter as Record<string, unknown>;
          const title = metadata.title as string;
          const description = metadata.description as string;
          let content: string;
          if (file.value instanceof Uint8Array) {
            content = file.value.toString();
          } else {
            content = file.value;
          }
          if (file.path.includes("content/docs/cloud/api")) {
            // skip cloud api docs
            return next();
          }
          // eslint-disable-next-line turbo/no-undeclared-env-vars
          if (process.env.NODE_ENV === "development") {
            // skip development
            return next();
          }
          if (!title || !description) {
            throw new Error(`Missing title or description in ${file.path}`);
          }
          const id = relative(baseDir, file.path);

          if (
            // eslint-disable-next-line turbo/no-undeclared-env-vars
            process.env.LLAMA_CLOUD_UPSERT_PIPELINE_DOCUMENTS === "true" &&
            // eslint-disable-next-line turbo/no-undeclared-env-vars
            process.env.LLAMA_CLOUD_PIPELINE_ID !== undefined
          ) {
            PipelinesService.upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut(
              {
                baseUrl: "https://api.cloud.llamaindex.ai/",
                body: [
                  {
                    metadata: {
                      title,
                      description,
                      documentUrl: id,
                    },
                    text: content,
                    id,
                  },
                ],
                path: {
                  // eslint-disable-next-line turbo/no-undeclared-env-vars
                  pipeline_id: process.env.LLAMA_CLOUD_PIPELINE_ID,
                },
                throwOnError: true,
                headers: {
                  // eslint-disable-next-line turbo/no-undeclared-env-vars
                  Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`,
                },
              },
            ).catch((error) => {
              console.error(error);
            });
          }
          return next();
        };
      },
    ],
    rehypePlugins: (v) => [rehypeKatex, ...v],
  },
});
