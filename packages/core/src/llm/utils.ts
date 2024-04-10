import { AsyncLocalStorage, randomUUID } from "@llamaindex/env";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import type {
  MessageContent,
  MessageContentImageDetail,
  MessageContentTextDetail,
} from "../types.js";
import type { ChatResponse, LLM, LLMChat } from "./types.js";

export async function* streamConverter<S, D>(
  stream: AsyncIterable<S>,
  converter: (s: S) => D,
): AsyncIterable<D> {
  for await (const data of stream) {
    yield converter(data);
  }
}

export async function* streamReducer<S, D>(params: {
  stream: AsyncIterable<S>;
  reducer: (previousValue: D, currentValue: S) => D;
  initialValue: D;
  finished?: (value: D) => void;
}): AsyncIterable<S> {
  let value = params.initialValue;
  for await (const data of params.stream) {
    value = params.reducer(value, data);
    yield data;
  }
  if (params.finished) {
    params.finished(value);
  }
}

/**
 * Extracts just the text from a multi-modal message or the message itself if it's just text.
 */
export function extractText(message: MessageContent): string {
  if (typeof message !== "string" && !Array.isArray(message)) {
    console.warn(
      "extractText called with non-string message, this is likely a bug.",
    );
    return `${message}`;
  } else if (typeof message !== "string" && Array.isArray(message)) {
    // message is of type MessageContentDetail[] - retrieve just the text parts and concatenate them
    // so we can pass them to the context generator
    return message
      .filter((c): c is MessageContentTextDetail => c.type === "text")
      .map((c) => c.text)
      .join("\n\n");
  } else {
    return message;
  }
}

export function extractImage(
  message: MessageContent,
): MessageContentImageDetail[] {
  if (typeof message === "string") {
    return [];
  } else {
    return message.filter(
      (c): c is MessageContentImageDetail => c.type === "image_url",
    );
  }
}

/**
 * @internal
 */
export function wrapLLMEvent(
  originalMethod: LLMChat["chat"],
  _context: ClassMethodDecoratorContext,
) {
  return async function withLLMEvent(
    this: LLM,
    ...params: Parameters<LLMChat["chat"]>
  ): ReturnType<LLMChat["chat"]> {
    const id = randomUUID();
    getCallbackManager().dispatchEvent("llm-start", {
      payload: {
        id,
        messages: params[0].messages,
      },
    });
    const response = await originalMethod.call(this, ...params);
    if (Symbol.asyncIterator in response) {
      // save snapshot to restore it after the response is done
      const snapshot = AsyncLocalStorage.snapshot();
      const originalAsyncIterator = {
        [Symbol.asyncIterator]: response[Symbol.asyncIterator].bind(response),
      };
      response[Symbol.asyncIterator] = async function* () {
        const finalResponse: ChatResponse = {
          message: {
            content: "",
            role: "assistant",
          },
        };
        let firstOne = false;
        for await (const chunk of originalAsyncIterator) {
          if (!firstOne) {
            firstOne = true;
            finalResponse.message.content = chunk.delta;
          } else {
            finalResponse.message.content += chunk.delta;
          }
          yield chunk;
        }
        snapshot(() => {
          getCallbackManager().dispatchEvent("llm-end", {
            payload: {
              id,
              response: finalResponse,
            },
          });
        });
      };
    } else {
      getCallbackManager().dispatchEvent("llm-end", {
        payload: {
          id,
          response,
        },
      });
    }
    return response;
  };
}
