"use client";
import { ChatSection } from "@llamaindex/chat-ui";
import { useChat } from "ai/react";

export default function Page() {
  const handler = useChat();
  return (
    <div className="h-screen flex items-center justify-center">
      <ChatSection
        className="h-[72vh] w-[72vw] shadow-2xl rounded-2xl"
        handler={handler}
      />
    </div>
  );
}
