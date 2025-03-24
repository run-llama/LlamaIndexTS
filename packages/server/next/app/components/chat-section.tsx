"use client";

import { ChatSection as ChatSectionUI } from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { useChat } from "ai/react";
import CustomChatInput from "./ui/chat/chat-input";
import CustomChatMessages from "./ui/chat/chat-messages";
import { useClientConfig } from "./ui/chat/hooks/use-config";

export default function ChatSection() {
  const { backend } = useClientConfig();
  const handler = useChat({
    api: `${backend}/api/chat`,
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
    <ChatSectionUI handler={handler} className="w-full h-full">
      <CustomChatMessages />
      <CustomChatInput />
    </ChatSectionUI>
  );
}
