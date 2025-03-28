"use client";

import { ChatMessage } from "@llamaindex/chat-ui";
import { DeepResearchCard } from "./custom/deep-research-card";
import { ToolAnnotations } from "./tools/chat-tools";

export function ChatMessageContent() {
  return (
    <ChatMessage.Content>
      <ChatMessage.Content.Event />
      <ChatMessage.Content.AgentEvent />
      <DeepResearchCard />
      <ToolAnnotations />
      <ChatMessage.Content.Image />
      <ChatMessage.Content.Markdown />
      <ChatMessage.Content.DocumentFile />
      <ChatMessage.Content.Source />
      <ChatMessage.Content.SuggestedQuestions />
    </ChatMessage.Content>
  );
}
