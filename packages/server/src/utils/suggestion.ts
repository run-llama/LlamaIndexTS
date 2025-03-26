import type { StreamData } from "ai";
import { type ChatMessage, Settings } from "llamaindex";

const NEXT_QUESTION_PROMPT = `You're a helpful assistant! Your task is to suggest the next question that user might ask. 
Here is the conversation history
---------------------
{conversation}
---------------------
Given the conversation history, please give me 3 questions that user might ask next!
Your answer should be wrapped in three sticks which follows the following format:
\`\`\`
<question 1>
<question 2>
<question 3>
\`\`\`
`;

export const sendSuggestedQuestionsEvent = async (
  dataStream: StreamData,
  chatHistory: ChatMessage[] = [],
) => {
  const questions = await generateNextQuestions(chatHistory);
  if (questions.length > 0) {
    dataStream.appendMessageAnnotation({
      type: "suggested_questions",
      data: questions,
    });
  }
};

async function generateNextQuestions(conversation: ChatMessage[]) {
  const conversationText = conversation
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
  const message = NEXT_QUESTION_PROMPT.replace(
    "{conversation}",
    conversationText,
  );

  try {
    const response = await Settings.llm.complete({ prompt: message });
    const questions = extractQuestions(response.text);
    return questions;
  } catch (error) {
    console.error("Error when generating the next questions: ", error);
    return [];
  }
}

function extractQuestions(text: string): string[] {
  // Extract the text inside the triple backticks
  const contentMatch = text.match(/```(.*?)```/s);
  const content = contentMatch?.[1] ?? "";

  // Split the content by newlines to get each question
  const questions = content
    .split("\n")
    .map((question) => question.trim())
    .filter((question) => question !== "");

  return questions;
}
