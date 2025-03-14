import { baseOptions } from "@/app/layout.config";
import { AITrigger } from "@/components/ai-chat";
import { buttonVariants } from "@/components/ui/button";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import "fumadocs-twoslash/twoslash.css";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
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
                  "text-fd-muted-foreground ms-2 gap-1.5 rounded-full px-2 md:flex-1",
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
  );
}
