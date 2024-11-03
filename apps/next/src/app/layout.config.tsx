import { Badge } from "@/components/ui/badge";
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
      text: (
        <div className="relative">
          Docs
          <Badge
            variant="outline"
            className="text-blue-500 absolute -top-5 -left-5 bg-fd-background hover:scale-125 transition-transform -rotate-3 hover:-rotate-12"
          >
            new
          </Badge>
        </div>
      ),
      url: "/docs/llamaindex",
      active: "nested-url",
    },
  ],
};
