const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const getEmbeddings = async (
  text: string,
  model = "text-embedding-ada-002"
) => {
  return await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: text, model: model }),
  });
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

interface FunctionMessage {
  role: "function";
  content?: string;
  name: string;
  function_call?: string;
}

export type Message = ChatMessage | FunctionMessage;

export const getChatCompletions = async (
  messages: Message[],
  model = "gpt-3.5-turbo"
) => {
  return await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });
};
