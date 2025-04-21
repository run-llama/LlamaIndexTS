"use client";

import { ChatMessage } from "@llamaindex/chat-ui";

export function ChatMessageAvatar() {
  return (
    <ChatMessage.Avatar>
      <img
        className="border-1 rounded-full border-[#e711dd]"
        src="/llama.png"
        alt="Llama Logo"
      />
    </ChatMessage.Avatar>
  );
}
