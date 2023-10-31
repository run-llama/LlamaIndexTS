"use client";

import { useChat } from "ai/react";
import { ChatInput, ChatMessages, Message } from "../../../../ui/html/chat";

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
