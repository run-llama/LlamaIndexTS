import { AIProvider } from "@/actions";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Banner } from "fumadocs-ui/components/banner";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "shiki-magic-move/dist/style.css";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <TooltipProvider>
          <AIProvider>
            <RootProvider>
              <Banner variant="rainbow" id="experimental">
                Welcome to the experimental LlamaIndex.TS documentation site.
                Some content are still in progress, you are welcome to help
                contribute to the documentation
              </Banner>
              {children}
            </RootProvider>
          </AIProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
