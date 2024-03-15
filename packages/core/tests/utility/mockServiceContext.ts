import {
  OpenAI,
  OpenAIEmbedding,
  serviceContextFromDefaults,
} from "llamaindex";

import {
  mockEmbeddingModel,
  mockLlmGeneration,
} from "../utility/mockOpenAI.js";

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
