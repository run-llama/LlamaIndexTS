import { useChatUI } from "@llamaindex/chat-ui";
import { StarterQuestions } from "@llamaindex/chat-ui/widgets";
import { getConfig } from "../lib/utils";

export function ChatStarter() {
  const { append } = useChatUI();
  const starterQuestions = getConfig("STARTER_QUESTIONS") ?? [];

  if (starterQuestions.length === 0) return null;
  return <StarterQuestions append={append} questions={starterQuestions} />;
}
