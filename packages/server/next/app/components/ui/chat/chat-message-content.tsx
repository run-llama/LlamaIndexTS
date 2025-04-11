"use client";

import { ChatMessage } from "@llamaindex/chat-ui";
import { DynamicEvents } from "./custom/events/dynamic-events";
import { ComponentDef } from "./custom/events/types";
import { ToolAnnotations } from "./tools/chat-tools";

export function ChatMessageContent({
  componentDefs,
}: {
  componentDefs: ComponentDef[];
}) {
  return (
    <ChatMessage.Content>
      <ChatMessage.Content.Event />
      <ChatMessage.Content.AgentEvent />
      <ToolAnnotations />
      <ChatMessage.Content.Image />
      <DynamicEvents componentDefs={componentDefs} />
      <ChatMessage.Content.Markdown />
      <ChatMessage.Content.DocumentFile />
      <ChatMessage.Content.Source />
      <ChatMessage.Content.SuggestedQuestions />
    </ChatMessage.Content>
  );
}
