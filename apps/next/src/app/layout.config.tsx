import { DOCUMENT_URL } from "@/lib/const";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

const logo = (
  <Image
    src="/logo-large.png"
    alt="Logo"
    className="size-8"
    width={147}
    height={147}
  />
);

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: logo,
    transparentMode: "top",
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
