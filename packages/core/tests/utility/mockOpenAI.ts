import { globalsHelper } from "llamaindex/GlobalsHelper";
import { CallbackManager } from "llamaindex/callbacks/CallbackManager";
import { OpenAIEmbedding } from "llamaindex/embeddings/index";
import { OpenAI } from "llamaindex/llm/LLM";
import { LLMChatParamsBase } from "llamaindex/llm/types";
import { vi } from "vitest";

export const DEFAULT_LLM_TEXT_OUTPUT = "MOCK_TOKEN_1-MOCK_TOKEN_2";

export function mockLlmGeneration({
  languageModel,
  callbackManager,
}: {
  languageModel: OpenAI;
  callbackManager?: CallbackManager;
}) {
  vi.spyOn(languageModel, "chat").mockImplementation(
    async ({ messages, parentEvent }: LLMChatParamsBase) => {
      const text = DEFAULT_LLM_TEXT_OUTPUT;
      const event = globalsHelper.createEvent({
        parentEvent,
        type: "llmPredict",
      });
      if (callbackManager?.onLLMStream) {
        const chunks = text.split("-");
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          callbackManager?.onLLMStream({
            event,
            index: i,
            token: {
              id: "id",
              object: "object",
              created: 1,
              model: "model",
              choices: [
                {
                  index: 0,
                  delta: {
                    content: chunk,
                  },
                  finish_reason: null,
                },
              ],
            },
          });
        }
        callbackManager?.onLLMStream({
          event,
          index: chunks.length,
          isDone: true,
        });
      }
      return new Promise((resolve) => {
        resolve({
          message: {
            content: text,
            role: "assistant",
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
  callbackManager: CallbackManager;
}) {
  vi.spyOn(languageModel, "chat").mockImplementation(
    () =>
      new Promise((resolve) =>
        resolve({
          message: {
            content: "The sum is 2",
            role: "assistant",
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
  callbackManager: CallbackManager;
}) {
  vi.spyOn(languageModel, "chat").mockImplementation(
    async ({ messages, parentEvent }: LLMChatParamsBase) => {
      const text = structuredOutput;
      const event = globalsHelper.createEvent({
        parentEvent,
        type: "llmPredict",
      });
      if (callbackManager?.onLLMStream) {
        const chunks = text.split("-");
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          callbackManager?.onLLMStream({
            event,
            index: i,
            token: {
              id: "id",
              object: "object",
              created: 1,
              model: "model",
              choices: [
                {
                  index: 0,
                  delta: {
                    content: chunk,
                  },
                  finish_reason: null,
                },
              ],
            },
          });
        }
        callbackManager?.onLLMStream({
          event,
          index: chunks.length,
          isDone: true,
        });
      }
      return new Promise((resolve) => {
        resolve({
          message: {
            content: text,
            role: "assistant",
          },
        });
      });
    },
  );
}
