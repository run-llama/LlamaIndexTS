import * as Base from "fumadocs-ui/components/codeblock";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki";

export interface CodeBlockProps {
  code: string;
  wrapper?: Base.CodeBlockProps;
  lang: "bash" | "ts" | "tsx";
}

export async function CodeBlock({
  code,
  lang,
  wrapper,
}: CodeBlockProps): Promise<React.ReactElement> {
  const hast = await codeToHast(code, {
    lang,
    defaultColor: false,
    themes: {
      light: "github-light",
      dark: "vesper",
    },
    transformers: [
      {
        name: "rehype-code:pre-process",
        line(node) {
          if (node.children.length === 0) {
            // Keep the empty lines when using grid layout
            node.children.push({
              type: "text",
              value: " ",
            });
          }
        },
      },
    ],
  });

  const isDev = process.env.NODE_ENV === "development";

  const rendered = toJsxRuntime(hast, {
    jsx,
    jsxs,
    jsxDEV: isDev ? jsxDEV : undefined,
    Fragment,
    development: isDev,
    components: {
      pre: Base.Pre,
    },
  });

  return <Base.CodeBlock {...wrapper}>{rendered}</Base.CodeBlock>;
}
