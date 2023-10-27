"use client";

import ChatAvatar from "@/app/components/chat-avatar";
import { ChatMessage } from "llamaindex";

export default function ChatItem(chatMessage: ChatMessage) {
  return (
    <div className="flex items-start gap-4 pt-5">
      <ChatAvatar {...chatMessage} />
      <p className="break-words">{chatMessage.content}</p>
    </div>
  );
}
