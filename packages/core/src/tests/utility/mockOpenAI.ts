import { OpenAIEmbedding } from "../../Embedding";
import { globalsHelper } from "../../GlobalsHelper";
import { ChatMessage, OpenAI } from "../../LLM";
import { CallbackManager, Event } from "../../callbacks/CallbackManager";

export function mockLlmGeneration({
  languageModel,
  callbackManager,
}: {
  languageModel: OpenAI;
  callbackManager: CallbackManager;
}) {
  jest
    .spyOn(languageModel, "chat")
    .mockImplementation(
      async (messages: ChatMessage[], parentEvent?: Event) => {
        const text = "MOCK_TOKEN_1-MOCK_TOKEN_2";
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
      }
    );
}

export function mockEmbeddingModel(embedModel: OpenAIEmbedding) {
  jest.spyOn(embedModel, "getTextEmbedding").mockImplementation(async (x) => {
    return new Promise((resolve) => {
      resolve([1, 0, 0, 0, 0, 0]);
    });
  });
  jest.spyOn(embedModel, "getQueryEmbedding").mockImplementation(async (x) => {
    return new Promise((resolve) => {
      resolve([0, 1, 0, 0, 0, 0]);
    });
  });
}
