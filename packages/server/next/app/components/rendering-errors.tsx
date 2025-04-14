"use client";

import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { XIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { buttonVariants } from "./ui/button";
import { cn } from "./ui/lib/utils";

export function RenderingErrors({
  uniqueErrors,
  clearErrors,
}: {
  uniqueErrors: string[];
  clearErrors: () => void;
}) {
  if (uniqueErrors.length === 0) return null;
  return (
    <Accordion
      type="single"
      defaultValue="errors"
      collapsible
      className="rounded-2xl bg-white"
    >
      <AccordionItem value="errors" className="border-none p-4 py-2">
        <AccordionTrigger className="py-2 hover:no-underline">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-bold">
                Rendering errors
              </span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs text-white">
                {uniqueErrors.length}
              </span>
            </div>
            <div
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              onClick={(e) => {
                e.stopPropagation();
                clearErrors();
              }}
            >
              <XIcon className="mr-2 h-4 w-4" />
              <span>Clear all</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mt-2 pb-0">
          <div className="space-y-2">
            {uniqueErrors.map((error, index) => (
              <p key={index} className="text-muted-foreground text-sm">
                {error}
              </p>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
