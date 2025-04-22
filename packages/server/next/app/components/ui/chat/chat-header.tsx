"use client";

import { Sparkles, Star } from "lucide-react";
import { Button } from "../button";
import { getConfig } from "../lib/utils";

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between px-4 pt-2">
      <ChatAppTitle />
      <LlamaIndexLinks />
    </div>
  );
}

function ChatAppTitle() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="size-4" />
      <h1 className="font-semibold">{getConfig("APP_TITLE")}</h1>
    </div>
  );
}

function LlamaIndexLinks() {
  return (
    <div className="flex items-center justify-end gap-4">
      <div className="flex items-center gap-2">
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
      <a
        href="https://github.com/run-llama/LlamaIndexTS"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="sm">
          <Star className="mr-2 size-4" />
          Star on GitHub
        </Button>
      </a>
    </div>
  );
}
