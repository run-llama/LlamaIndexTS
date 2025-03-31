"use client";

import { ChatSection as ChatSectionUI } from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { useChat } from "ai/react";
import Header from "./header";
import CustomChatInput from "./ui/chat/chat-input";
import CustomChatMessages from "./ui/chat/chat-messages";
import { getConfig } from "./ui/lib/utils";

export default function ChatSection() {
  const handler = useChat({
    api: getConfig("CHAT_API"),
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      let errorMessage: string;
      try {
        errorMessage = JSON.parse(error.message).detail;
      } catch (e) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    },
    experimental_throttle: 100,
  });
  return (
    <div className="flex h-[85vh] w-full flex-col gap-2">
      <Header />
      <ChatSectionUI handler={handler} className="min-h-0 w-full flex-1">
        <CustomChatMessages />
        <CustomChatInput />
      </ChatSectionUI>
    </div>
  );
}
