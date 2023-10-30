"use client";

import ChatInput from "@/app/components/ui/chat-input";
import { useChat } from "ai/react";
import ChatMessages from "./ui/chat-messages";

export default function ChatSection() {
  const { messages, input, isLoading, handleSubmit, handleInputChange } =
    useChat();

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
