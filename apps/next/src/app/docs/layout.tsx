import { baseOptions } from "@/app/layout.config";
import { AITrigger } from "@/components/ai-chat";
import { buttonVariants } from "@/components/ui/button";
import { LEGACY_DOCUMENT_URL } from "@/lib/const";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import "fumadocs-twoslash/twoslash.css";
import { Banner } from "fumadocs-ui/components/banner";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Banner variant="rainbow" id="welcome">
        Welcome to the new LlamaIndex.TS documentation! 🎉 If you are looking
        for the old documentation
        <a
          className="underline text-blue-500 ml-1"
          target="_blank"
          href={LEGACY_DOCUMENT_URL}
        >
          check it here
        </a>
        .
      </Banner>
      <DocsLayout
        tree={source.pageTree}
        {...baseOptions}
        nav={{
          ...baseOptions.nav,
          children: (
            <AITrigger
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "xs",
                  className:
                    "md:flex-1 px-2 ms-2 gap-1.5 text-fd-muted-foreground rounded-full",
                }),
              )}
            >
              <MessageCircle className="size-3" />
              Ask LlamaCloud
            </AITrigger>
          ),
        }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
