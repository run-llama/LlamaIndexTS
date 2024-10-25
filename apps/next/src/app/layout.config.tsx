import { DOCUMENT_URL } from "@/lib/const";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "LlamaIndex.TS",
  },
  githubUrl: "https://github.com/run-llama/LlamaIndexTS",
  links: [
    {
      text: "Documentation",
      url: DOCUMENT_URL,
      active: "nested-url",
    },
  ],
};
