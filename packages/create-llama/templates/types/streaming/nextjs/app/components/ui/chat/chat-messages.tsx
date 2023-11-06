"use client";

import { useEffect, useRef } from "react";
import ChatItem from "./chat-item";

export interface Message {
  id: string;
  content: string;
  role: string;
}

export default function ChatMessages({
  messages,
  isLoading,
  reload,
  stop,
}: {
  messages: Message[];
  isLoading?: boolean;
  stop?: () => void;
  reload?: () => void;
}) {
  const scrollableChatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollableChatContainerRef.current) {
      scrollableChatContainerRef.current.scrollTop =
        scrollableChatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="w-full max-w-5xl p-4 bg-white rounded-xl shadow-xl">
      <div
        className="flex flex-col gap-5 divide-y h-[50vh] overflow-auto"
        ref={scrollableChatContainerRef}
      >
        {messages.map((m: Message) => (
          <ChatItem key={m.id} {...m} />
        ))}
      </div>
    </div>
  );
}
