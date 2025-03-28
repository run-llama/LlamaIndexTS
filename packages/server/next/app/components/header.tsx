"use client";

import { getConfig } from "./ui/lib/utils";

export default function Header() {
  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
      <div className="flex w-full flex-col items-center pb-2 text-center">
        <h1 className="mb-2 text-4xl font-bold">{getConfig("APP_TITLE")}</h1>
        <div className="flex items-center justify-center gap-2">
          <a
            href="https://www.llamaindex.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Built by LlamaIndex
          </a>
          <img
            className="h-[24px] w-[24px] rounded-sm"
            src="/llama.png"
            alt="Llama Logo"
          />
        </div>
      </div>
    </div>
  );
}
