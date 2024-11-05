"use client";
import { ChatSection } from "@llamaindex/chat-ui";
import { useChat } from "ai/react";

export default function Page(): JSX.Element {
  const handler = useChat();
  return <ChatSection handler={handler} />;
}
