import { ChatMessage, Settings } from "llamaindex";

export async function generateNextQuestions(conversation: ChatMessage[]) {
  const llm = Settings.llm;
  const NEXT_QUESTION_PROMPT = process.env.NEXT_QUESTION_PROMPT;
  if (!NEXT_QUESTION_PROMPT) {
    return [];
  }

  // Format conversation
  const conversationText = conversation
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
  const message = NEXT_QUESTION_PROMPT.replace(
    "{conversation}",
    conversationText,
  );

  try {
    const response = await llm.complete({ prompt: message });
    const questions = extractQuestions(response.text);
    return questions;
  } catch (error) {
    console.error("Error when generating the next questions: ", error);
    return [];
  }
}

// TODO: instead of parsing the LLM's result we can use structured predict, once LITS supports it
function extractQuestions(text: string): string[] {
  // Extract the text inside the triple backticks
  // @ts-ignore
  const contentMatch = text.match(/```(.*?)```/s);
  const content = contentMatch ? contentMatch[1] : "";

  // Split the content by newlines to get each question
  const questions = content
    .split("\n")
    .map((question) => question.trim())
    .filter((question) => question !== "");

  return questions;
}
