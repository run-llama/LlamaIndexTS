"use client";

import { ChatMessage, ChatMessages, useChatUI } from "@llamaindex/chat-ui";
import { ChatMessageAvatar } from "./chat-avatar";
import { ChatMessageContent } from "./chat-message-content";
import { ChatStarter } from "./chat-starter";
import { ComponentDef } from "./dynamic-events";

export default function CustomChatMessages({
  componentDefs,
}: {
  componentDefs: ComponentDef[];
}) {
  const { messages } = useChatUI();

  return (
    <ChatMessages className="rounded-xl shadow-xl">
      <ChatMessages.List>
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLast={index === messages.length - 1}
          >
            <ChatMessageAvatar />
            <ChatMessageContent componentDefs={componentDefs} />
            <ChatMessage.Actions />
          </ChatMessage>
        ))}
        <ChatMessages.Loading />
      </ChatMessages.List>
      <ChatMessages.Actions />
      <ChatStarter />
    </ChatMessages>
  );
}
