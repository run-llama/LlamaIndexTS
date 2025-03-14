import { highlight } from "fumadocs-core/highlight";
import * as Base from "fumadocs-ui/components/codeblock";
import type { BundledLanguage } from "shiki";

export interface CodeBlockProps {
  code: string;
  wrapper?: Base.CodeBlockProps;
  lang: BundledLanguage;
}

export async function CodeBlock({ code, lang, wrapper }: CodeBlockProps) {
  const rendered = await highlight(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "vesper",
    },
    components: {
      pre: Base.Pre,
    },
  });

  return <Base.CodeBlock {...wrapper}>{rendered}</Base.CodeBlock>;
}
