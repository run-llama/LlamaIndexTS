"use client";
import { ChatSection } from "@llamaindex/chat-ui";
import { useChat } from "ai/react";

export const ChatDemo = () => {
  const handler = useChat();
  return <ChatSection handler={handler} />;
};
