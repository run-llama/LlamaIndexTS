import { useChatUI } from "@llamaindex/chat-ui";
import { StarterQuestions } from "@llamaindex/chat-ui/widgets";
import { getConfig } from "../lib/utils";

export function ChatStarter() {
  const { append } = useChatUI();

  return (
    <StarterQuestions append={append} questions={getConfig("STARTER_QUESTIONS")} />
  );
}
