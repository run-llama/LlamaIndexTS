"use client";
import { cn } from "@/lib/utils";
import { Info, X } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type AITriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const AITrigger = (props: AITriggerProps) => {
  return (
    <Dialog>
      <DialogTrigger {...props} />
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-fd-background/50 backdrop-blur-sm data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in" />
        <DialogContent
          onOpenAutoFocus={(e) => {
            document.getElementById("nd-ai-input")?.focus();
            e.preventDefault();
          }}
          className="fixed left-1/2 z-50 my-[5vh] flex max-h-[90dvh] w-[98vw] max-w-[860px] origin-left -translate-x-1/2 flex-col rounded-lg border bg-fd-popover text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in"
        >
          <DialogTitle className="sr-only">Search AI</DialogTitle>
          <DialogDescription className="sr-only">
            Ask AI some questions.
          </DialogDescription>
          <DialogClose
            aria-label="Close Dialog"
            tabIndex={-1}
            className={cn(
              "absolute right-1 top-1 rounded-full bg-fd-muted p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
            )}
          >
            <X className="size-4" />
          </DialogClose>
          <p className="inline-flex items-center gap-0.5 p-2 text-xs text-fd-muted-foreground">
            <Info className="inline size-5 shrink-0 fill-blue-500 text-fd-popover" />
            <span>
              Answers from AI may be inaccurate, please verify the information.
            </span>
          </p>
          // todo
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
