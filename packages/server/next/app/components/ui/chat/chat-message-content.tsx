"use client";

import { ChatMessage } from "@llamaindex/chat-ui";
import { DynamicEvents } from "./dynamic-events";
import { ToolAnnotations } from "./tools/chat-tools";

export function ChatMessageContent() {
  return (
    <ChatMessage.Content>
      <ChatMessage.Content.Event />
      <ChatMessage.Content.AgentEvent />
      <ToolAnnotations />
      <ChatMessage.Content.Image />
      <DynamicEvents />
      <ChatMessage.Content.Markdown />
      <ChatMessage.Content.DocumentFile />
      <ChatMessage.Content.Source />
      <ChatMessage.Content.SuggestedQuestions />
    </ChatMessage.Content>
  );
}
