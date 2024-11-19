"use client";
import { ChatInput, ChatMessages, ChatSection } from "@llamaindex/chat-ui";
import { useChat } from "ai/react";

export const ChatDemo = () => {
  const handler = useChat();
  return (
    <ChatSection handler={handler}>
      <ChatMessages>
        <ChatMessages.List className="h-auto max-h-[400px]" />
        <ChatMessages.Actions />
      </ChatMessages>
      <ChatInput />
    </ChatSection>
  );
};
