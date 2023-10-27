"use client";

import ChatItem from "@/app/components/chat-item";
import { useChat } from "@/app/components/chat-section";
import { useEffect, useRef } from "react";

export default function ChatHistory() {
  const scrollableChatContainerRef = useRef<HTMLDivElement>(null);
  const { chatHistory } = useChat();

  const scrollToBottom = () => {
    if (scrollableChatContainerRef.current) {
      scrollableChatContainerRef.current.scrollTop =
        scrollableChatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.length]);

  return (
    <div className="w-full max-w-5xl p-4 bg-white rounded-xl shadow-xl">
      <div
        className="flex flex-col gap-5 divide-y h-[50vh] overflow-auto"
        ref={scrollableChatContainerRef}
      >
        {chatHistory.map((chatMessage, index) => (
          <ChatItem key={index} {...chatMessage} />
        ))}
      </div>
    </div>
  );
}
