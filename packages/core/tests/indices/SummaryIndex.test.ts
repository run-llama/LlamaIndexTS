import type { ServiceContext } from "llamaindex";
import {
  Document,
  OpenAI,
  OpenAIEmbedding,
  SummaryIndex,
  VectorStoreIndex,
  serviceContextFromDefaults,
  storageContextFromDefaults,
} from "llamaindex";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  mockEmbeddingModel,
  mockLlmGeneration,
} from "../utility/mockOpenAI.js";

// Mock the OpenAI getOpenAISession function during testing
vi.mock("llamaindex/llm/open_ai", () => {
  return {
    getOpenAISession: vi.fn().mockImplementation(() => null),
  };
});

describe("SummaryIndex", () => {
  let serviceContext: ServiceContext;

  beforeAll(() => {
    const embeddingModel = new OpenAIEmbedding();
    const llm = new OpenAI();

    mockEmbeddingModel(embeddingModel);
    mockLlmGeneration({ languageModel: llm });

    const ctx = serviceContextFromDefaults({
      embedModel: embeddingModel,
      llm,
    });

    serviceContext = ctx;
  });

  it("SummaryIndex and VectorStoreIndex must be able to share the same storage context", async () => {
    const storageContext = await storageContextFromDefaults({
      persistDir: "/tmp/test_dir",
    });
    const documents = [new Document({ text: "lorem ipsem", id_: "1" })];
    const vectorIndex = await VectorStoreIndex.fromDocuments(documents, {
      serviceContext,
      storageContext,
    });
    expect(vectorIndex).toBeDefined();
    const summaryIndex = await SummaryIndex.fromDocuments(documents, {
      serviceContext,
      storageContext,
    });
    expect(summaryIndex).toBeDefined();
  });
});
