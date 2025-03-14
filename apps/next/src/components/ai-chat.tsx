"use client";
import type { AIProvider, UIMessage } from "@/actions";
import { UserMessage } from "@/components/message";
import { useActions, useUIState } from "ai/rsc";
import { Info } from "lucide-react";
import { ButtonHTMLAttributes, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type AITriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

function ChatList({ messages }: { messages: UIMessage[] }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="relative mx-auto w-full px-4">
      {messages.map((message, index) => (
        <div key={index} className="pb-4">
          {message.display}
        </div>
      ))}
    </div>
  );
}

export const AITrigger = (props: AITriggerProps) => {
  const [{ messages }, setUIState] = useUIState<typeof AIProvider>();
  const { query } = useActions<typeof AIProvider>();
  const [inputValue, setInputValue] = useState("");
  return (
    <Dialog>
      <DialogTrigger {...props} />
      <DialogPortal>
        <DialogOverlay className="bg-fd-background/50 data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in fixed inset-0 z-50 backdrop-blur-sm" />
        <DialogContent
          onOpenAutoFocus={(e) => {
            document.getElementById("nd-ai-input")?.focus();
            e.preventDefault();
          }}
          className="bg-fd-popover text-fd-popover-foreground data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in fixed left-1/2 z-50 my-[5vh] flex max-h-[90dvh] w-[98vw] max-w-[860px] origin-left -translate-x-1/2 flex-col rounded-lg border shadow-lg focus-visible:outline-none"
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Search AI</DialogTitle>
            <DialogDescription className="sr-only">
              Ask AI some questions.
            </DialogDescription>
            <Alert>
              <Info className="size-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                Answers from LlamaCloud may be inaccurate, please use with
                discretion.
              </AlertDescription>
            </Alert>
          </DialogHeader>
          <div className="mt-4 flex-grow overflow-scroll">
            <ChatList messages={messages} />
          </div>
          <form
            className="space-y-4 px-4 py-2"
            action={async () => {
              const value = inputValue.trim();
              setInputValue("");
              if (!value) return;

              // Add user message UI
              setUIState((state) => ({
                ...state,
                messages: [
                  ...state.messages,
                  {
                    id: Date.now(),
                    display: <UserMessage>{value}</UserMessage>,
                  },
                ],
              }));

              try {
                // Submit and get response message
                const responseMessage = await query(value);
                setUIState((state) => ({
                  ...state,
                  messages: [...state.messages, responseMessage],
                }));
              } catch (error) {
                // You may want to show a toast or trigger an error state.
                console.error(error);
              }
            }}
          >
            <div className="flex w-full flex-row items-center gap-2">
              <Textarea
                tabIndex={0}
                placeholder="Ask AI about documentation."
                className="w-full resize-none bg-transparent px-4 focus-within:outline-none sm:text-sm"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit(null);
                  }
                }}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                name="message"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={inputValue === ""}
                  >
                    <span className="sr-only">Send message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
