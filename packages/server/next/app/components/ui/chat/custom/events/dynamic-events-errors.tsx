"use client";

import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { XIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../accordion";
import { buttonVariants } from "../../../button";
import { cn } from "../../../lib/utils";

export function DynamicEventsErrors({
  errors,
  clearErrors,
}: {
  errors: string[];
  clearErrors: () => void;
}) {
  if (errors.length === 0) return null;
  return (
    <Accordion
      type="single"
      defaultValue="errors"
      collapsible
      className="rounded-xl border border-gray-100 bg-white shadow-md"
    >
      <AccordionItem value="errors" className="border-none px-4">
        <AccordionTrigger className="py-2 hover:no-underline">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-bold">
                Errors when rendering dynamic events from components directory
              </span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs text-white">
                {errors.length}
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
        <AccordionContent className="pb-4">
          <div className="space-y-2">
            {errors.map((error, index) => (
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
