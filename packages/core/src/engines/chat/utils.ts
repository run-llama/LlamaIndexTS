import type { ChatHistory } from "../../ChatHistory.js";
import type { ChatMessage, MessageContent } from "../../llm/types.js";
import { extractText } from "../../llm/utils.js";
import type { ContextGenerator } from "./types.js";

const prependSystemPrompt = (
  message: ChatMessage,
  systemPrompt?: string,
): ChatMessage => {
  if (!systemPrompt) return message;
  return {
    ...message,
    content: systemPrompt.trim() + "\n" + message.content,
  };
};

export const prepareRequestMessagesWithContext = async (params: {
  message: MessageContent;
  chatHistory: ChatHistory;
  contextGenerator: ContextGenerator;
  systemPrompt?: string;
}) => {
  params.chatHistory.addMessage({
    content: params.message,
    role: "user",
  });
  const textOnly = extractText(params.message);
  const context = await params.contextGenerator.generate(textOnly);

  const messages = await params.chatHistory.requestMessages([
    prependSystemPrompt(context.message, params.systemPrompt),
  ]);
  return { nodes: context.nodes, messages };
};
