"use client";

import { getConfig } from "./ui/lib/utils";

export default function Header() {
  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <p className="bg-linear-to-b fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:dark:bg-zinc-800/30">
        {getConfig("APP_TITLE")}
      </p>
      <div className="bg-linear-to-t fixed bottom-0 left-0 mb-4 flex h-auto w-full items-end justify-center from-white via-white lg:static lg:mb-0 lg:w-auto lg:bg-none dark:from-black dark:via-black">
        <a
          href="https://www.llamaindex.ai/"
          className="font-nunito flex items-center justify-center gap-2 text-lg font-bold"
        >
          <span>Built by LlamaIndex</span>
          <img
            className="h-[40px] w-[40px] rounded-xl"
            src="/llama.png"
            alt="Llama Logo"
          />
        </a>
      </div>
    </div>
  );
}
