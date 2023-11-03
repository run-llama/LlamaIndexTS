"use client";

import { useChat } from "ai/react";
import { ChatInput, ChatMessages } from "./ui/chat";

export default function ChatSection() {
  const { messages, input, isLoading, handleSubmit, handleInputChange } =
    useChat({ api: process.env.NEXT_PUBLIC_CHAT_API });

  return (
    <>
      <ChatMessages messages={messages} />
      <ChatInput
        input={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
      />
    </>
  );
}
