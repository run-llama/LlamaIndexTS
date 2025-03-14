import { AsyncLocalStorage, randomUUID } from "@llamaindex/env";
import { Settings } from "../global";
import type { ChatResponse, ChatResponseChunk, LLM, LLMChat } from "../llms";

export function wrapLLMEvent<
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
>(
  originalMethod: LLMChat<
    AdditionalChatOptions,
    AdditionalMessageOptions
  >["chat"],
  _context: ClassMethodDecoratorContext,
) {
  return async function withLLMEvent(
    this: LLM<AdditionalChatOptions, AdditionalMessageOptions>,
    ...params: Parameters<
      LLMChat<AdditionalChatOptions, AdditionalMessageOptions>["chat"]
    >
  ): ReturnType<
    LLMChat<AdditionalChatOptions, AdditionalMessageOptions>["chat"]
  > {
    const id = randomUUID();
    Settings.callbackManager.dispatchEvent("llm-start", {
      id,
      messages: params[0].messages,
    });
    const response = await originalMethod.call(this, ...params);
    if (Symbol.asyncIterator in response) {
      // save snapshot to restore it after the response is done
      const snapshot = AsyncLocalStorage.snapshot();
      const originalAsyncIterator = {
        [Symbol.asyncIterator]: response[Symbol.asyncIterator].bind(response),
      };
      response[Symbol.asyncIterator] = async function* () {
        const finalResponse = {
          raw: [] as ChatResponseChunk[],
          message: {
            content: "",
            role: "assistant",
            options: {},
          },
        } satisfies ChatResponse;
        let firstOne = false;
        for await (const chunk of originalAsyncIterator) {
          if (!firstOne) {
            firstOne = true;
            finalResponse.message.content = chunk.delta;
          } else {
            finalResponse.message.content += chunk.delta;
          }
          if (chunk.options) {
            finalResponse.message.options = {
              ...finalResponse.message.options,
              ...chunk.options,
            };
          }
          Settings.callbackManager.dispatchEvent("llm-stream", {
            id,
            chunk,
          });
          finalResponse.raw.push(chunk);
          yield chunk;
        }
        snapshot(() => {
          Settings.callbackManager.dispatchEvent("llm-end", {
            id,
            response: finalResponse,
          });
        });
      };
    } else {
      Settings.callbackManager.dispatchEvent("llm-end", {
        id,
        response,
      });
    }
    return response;
  };
}
