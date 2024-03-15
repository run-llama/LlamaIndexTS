import {
  OpenAI,
  OpenAIEmbedding,
  serviceContextFromDefaults,
} from "llamaindex";

import {
  mockEmbeddingModel,
  mockLlmGeneration,
} from "../utility/mockOpenAI.js";

import { vi } from "vitest";

// Mock the OpenAI getOpenAISession function during testing
vi.mock("llamaindex/llm/open_ai", () => {
  return {
    getOpenAISession: vi.fn().mockImplementation(() => null),
  };
});

export function mockServiceContext() {
  const embeddingModel = new OpenAIEmbedding();
  const llm = new OpenAI();

  mockEmbeddingModel(embeddingModel);
  mockLlmGeneration({ languageModel: llm });

  return serviceContextFromDefaults({
    embedModel: embeddingModel,
    llm,
  });
}
