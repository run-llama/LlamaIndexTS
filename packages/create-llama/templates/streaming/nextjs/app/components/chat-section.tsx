"use client";

import MessageForm from "@/app/components/message-form";
import { useChat } from "ai/react";
import ChatHistory from "./chat-history";

export default function ChatSection() {
  const chat = useChat();

  return (
    <>
      <ChatHistory messages={chat.messages} />
      <MessageForm chat={chat} />
    </>
  );
}
