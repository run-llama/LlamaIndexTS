"use client";

import { useChatMessage } from "@llamaindex/chat-ui";
import { User2 } from "lucide-react";

export function ChatMessageAvatar() {
  const { message } = useChatMessage();
  if (message.role === "user") {
    return (
      <div className="bg-background flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        <User2 className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-black text-white shadow-sm">
      <img
        className="h-[40px] w-[40px] rounded-xl object-contain"
        src="/llama.png"
        alt="Llama Logo"
      />
    </div>
  );
}
