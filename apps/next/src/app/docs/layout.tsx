import { baseOptions } from "@/app/layout.config";
import { source } from "@/libs/source";
import "fumadocs-twoslash/twoslash.css";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      links={[]}
      nav={{
        ...baseOptions.nav,
      }}
    >
      {children}
    </DocsLayout>
  );
}
