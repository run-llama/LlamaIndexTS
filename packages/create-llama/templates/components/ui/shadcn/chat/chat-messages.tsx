import { useEffect, useRef } from "react";

import ChatMessage, { Message } from "./chat-message";

export default function ChatMessages({ messages }: { messages: Message[] }) {
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
    <div className="mx-auto w-full max-w-5xl rounded-xl bg-white p-4 shadow-xl">
      <div
        className="flex h-[50vh] flex-col gap-5 divide-y overflow-auto"
        ref={scrollableChatContainerRef}
      >
        {messages.map((m) => (
          <ChatMessage key={m.id} {...m} />
        ))}
      </div>
    </div>
  );
}
