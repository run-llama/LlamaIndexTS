import {
  rehypeCodeDefaultOptions,
  remarkStructure,
} from "fumadocs-core/mdx-plugins";
import { fileGenerator, remarkDocGen, remarkInstall } from "fumadocs-docgen";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

export const docs = defineDocs({
  dir: [
    "./src/content/docs",
    "./node_modules/@llamaindex/workflow-docs",
    "./node_modules/@llamaindex/chat-ui-docs",
    // NOTE: When adding external docs (like chat-ui or workflow-docs above),
    // make sure to also update:
    // 1. scripts/validate-links.mts - add to ALLOWED_LINKS array
    // 2. next.config.mjs - add redirect for .mdx files
    // 3. src/content/docs/meta.json - add to pages array
  ],
  docs: {
    async: true,
  },
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
      remarkStructure,
      remarkMath,
      [remarkInstall, { persist: { id: "package-manager" } }],
      [remarkDocGen, { generators: [fileGenerator()] }],
    ],
    rehypePlugins: (v) => [rehypeKatex, ...v],
  },
});
