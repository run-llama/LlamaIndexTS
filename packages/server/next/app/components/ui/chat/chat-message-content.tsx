"use client";

import { ChatMessage } from "@llamaindex/chat-ui";
import { DynamicEvents } from "./custom/events/dynamic-events";
import { ComponentDef } from "./custom/events/types";
import { ToolAnnotations } from "./tools/chat-tools";

export function ChatMessageContent({
  componentDefs,
  appendError,
}: {
  componentDefs: ComponentDef[];
  appendError: (error: string) => void;
}) {
  return (
    <ChatMessage.Content>
      <ChatMessage.Content.Event />
      <ChatMessage.Content.AgentEvent />
      <ToolAnnotations />
      <ChatMessage.Content.Image />
      <DynamicEvents componentDefs={componentDefs} appendError={appendError} />
      <ChatMessage.Content.Markdown />
      <ChatMessage.Content.DocumentFile />
      <ChatMessage.Content.Source />
      <ChatMessage.Content.SuggestedQuestions />
    </ChatMessage.Content>
  );
}
