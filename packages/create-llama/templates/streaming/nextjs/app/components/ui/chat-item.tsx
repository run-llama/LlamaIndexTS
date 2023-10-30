"use client";

import ChatAvatar from "@/app/components/ui/chat-avatar";
import { Message } from "ai/react";

export default function ChatItem(chatMessage: Message) {
  return (
    <div className="flex items-start gap-4 pt-5">
      <ChatAvatar {...chatMessage} />
      <p className="break-words">{chatMessage.content}</p>
    </div>
  );
}
