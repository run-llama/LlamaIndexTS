import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
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
        <title>
          LlamaIndex.TS - Build LLM-powered document agents and workflows
        </title>
      </head>
      <GoogleTagManager gtmId="GTM-WWRFB36R" />
      <body className="flex min-h-screen flex-col">
        <TooltipProvider>
          <RootProvider>{children}</RootProvider>
        </TooltipProvider>
      </body>
      <GoogleAnalytics gaId="G-NB9B8LW9W5" />
    </html>
  );
}
