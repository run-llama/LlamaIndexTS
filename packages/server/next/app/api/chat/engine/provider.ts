import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { Settings } from "llamaindex";

export function setupProvider() {
  Settings.llm = new OpenAI({
    model: process.env.MODEL ?? "gpt-4o-mini",
    maxTokens: process.env.LLM_MAX_TOKENS
      ? Number(process.env.LLM_MAX_TOKENS)
      : undefined,
  });
  Settings.embedModel = new OpenAIEmbedding({
    model: process.env.EMBEDDING_MODEL,
    dimensions: process.env.EMBEDDING_DIM
      ? parseInt(process.env.EMBEDDING_DIM)
      : undefined,
  });
}
