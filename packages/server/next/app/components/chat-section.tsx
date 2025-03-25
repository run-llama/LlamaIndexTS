"use client";

import { ChatSection as ChatSectionUI } from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { useChat } from "ai/react";
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
  });
  return (
    <ChatSectionUI handler={handler} className="h-full w-full">
      <CustomChatMessages />
      <CustomChatInput />
    </ChatSectionUI>
  );
}
