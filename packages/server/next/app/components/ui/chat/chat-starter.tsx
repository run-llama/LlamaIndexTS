"use client";

import { useChatUI } from "@llamaindex/chat-ui";
import { StarterQuestions } from "@llamaindex/chat-ui/widgets";
import { getConfig } from "../lib/utils";

export function ChatStarter({ className }: { className?: string }) {
  const { append, messages, requestData } = useChatUI();
  const starterQuestions = getConfig("STARTER_QUESTIONS") ?? [];

  if (starterQuestions.length === 0 || messages.length > 0) return null;
  return (
    <StarterQuestions
      append={(message) => append(message, { data: requestData })}
      questions={starterQuestions}
      className={className}
    />
  );
}
