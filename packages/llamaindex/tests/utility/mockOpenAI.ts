import type { CallbackManager } from "@llamaindex/core/global";
import type { LLMChatParamsBase } from "llamaindex";
import { Settings } from "llamaindex";
import type { OpenAIEmbedding } from "llamaindex/embeddings/OpenAIEmbedding";
import { OpenAI } from "llamaindex/llm/openai";
import { vi } from "vitest";

export const DEFAULT_LLM_TEXT_OUTPUT = "MOCK_TOKEN_1-MOCK_TOKEN_2";

export function mockLlmGeneration({
  languageModel,
}: {
  languageModel?: OpenAI;
} = {}) {
  if (!languageModel && Settings.llm instanceof OpenAI) {
    languageModel = Settings.llm;
  }
  if (!languageModel) {
    return;
  }
  vi.spyOn(languageModel, "chat").mockImplementation(
    async ({ messages }: LLMChatParamsBase) => {
      const text = DEFAULT_LLM_TEXT_OUTPUT;
      return new Promise((resolve) => {
        resolve({
          get raw() {
            return {};
          },
          message: {
            content: text,
            role: "assistant",
            options: {},
          },
        });
      });
    },
  );
}

export function mockLlmToolCallGeneration({
  languageModel,
  callbackManager,
}: {
  languageModel: OpenAI;
  callbackManager?: CallbackManager;
}) {
  vi.spyOn(languageModel, "chat").mockImplementation(
    () =>
      new Promise((resolve) =>
        resolve({
          get raw() {
            return {};
          },
          message: {
            content: "The sum is 2",
            role: "assistant",
            options: {},
          },
        }),
      ),
  );
}

export function mockEmbeddingModel(
  embedModel: OpenAIEmbedding,
  embeddingsLength: number = 1,
) {
  vi.spyOn(embedModel, "getTextEmbedding").mockImplementation(async (x) => {
    return new Promise((resolve) => {
      resolve([1, 0, 0, 0, 0, 0]);
    });
  });
  vi.spyOn(embedModel, "getTextEmbeddings").mockImplementation(async (x) => {
    return new Promise((resolve) => {
      if (x.length > 1) {
        resolve(Array(x.length).fill([1, 0, 0, 0, 0, 0]));
      }
      resolve([[1, 0, 0, 0, 0, 0]]);
    });
  });
  vi.spyOn(embedModel, "getQueryEmbedding").mockImplementation(async (x) => {
    return new Promise((resolve) => {
      resolve([0, 1, 0, 0, 0, 0]);
    });
  });
}

const structuredOutput = JSON.stringify([
  {
    choice: 1,
    reason: "apple",
  },
]);

export function mocStructuredkLlmGeneration({
  languageModel,
  callbackManager,
}: {
  languageModel: OpenAI;
  callbackManager?: CallbackManager;
}) {
  vi.spyOn(languageModel, "chat").mockImplementation(
    async ({ messages }: LLMChatParamsBase) => {
      const text = structuredOutput;
      return new Promise((resolve) => {
        resolve({
          get raw() {
            return {};
          },
          message: {
            content: text,
            role: "assistant",
            options: {},
          },
        });
      });
    },
  );
}
