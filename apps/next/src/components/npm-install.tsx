"use client";
import { Button } from "@/components/ui/button";
import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

export const NpmInstall = () => {
  const { copy } = useClipboard();
  const [hasCheckIcon, setHasCheckIcon] = useState(false);

  return (
    <Button
      onClick={useCallback(() => {
        copy("npm i llamaindex")
          .then(() => {
            setHasCheckIcon(true);

            setTimeout(() => {
              setHasCheckIcon(false);
            }, 1000);
          })
          .catch(console.error);
      }, [copy])}
      variant="outline"
      className="flex flex-row items-center justify-center"
    >
      <code className="mr-2">$ npm i llamaindex</code>
      <div className="relative h-4 w-4 cursor-pointer bg-transparent">
        <div
          className={`absolute inset-0 transform transition-all duration-300 ${
            hasCheckIcon ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <Copy className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
        </div>
        <div
          className={`absolute inset-0 transform transition-all duration-300 ${
            hasCheckIcon ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <Check className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
        </div>
      </div>
    </Button>
  );
};
