"use client";
import { ChatSection } from "@llamaindex/chat-ui";
import { useChat } from "ai/react";
import { getConfig } from "./utils";

export default function Page() {
  const handler = useChat({ api: getConfig("CHAT_API") });
  return (
    <div className="flex h-screen items-center justify-center">
      <ChatSection
        className="h-[72vh] w-[72vw] rounded-2xl shadow-2xl"
        handler={handler}
      />
    </div>
  );
}
