import { getCurrentCallbackManager } from "../Settings.js";
import type { ChatResponse, LLM, LLMChat, MessageContent } from "./types.js";

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
  finished?: (value: D | undefined) => void;
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
 *
 * @param message The message to extract text from.
 * @returns The extracted text
 */

export function extractText(message: MessageContent): string {
  if (Array.isArray(message)) {
    // message is of type MessageContentDetail[] - retrieve just the text parts and concatenate them
    // so we can pass them to the context generator
    return message
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n\n");
  }
  return message;
}

/**
 * @internal
 */
export function llmEvent(
  originalMethod: LLMChat["chat"],
  _context: ClassMethodDecoratorContext,
) {
  return async function withLLMEvent(
    this: LLM,
    ...params: Parameters<LLMChat["chat"]>
  ): ReturnType<LLMChat["chat"]> {
    getCurrentCallbackManager().dispatchEvent("llm-start", {
      payload: {
        messages: params[0].messages,
      },
    });
    const response = await originalMethod.call(this, ...params);
    if (Symbol.asyncIterator in response) {
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
        getCurrentCallbackManager().dispatchEvent("llm-end", {
          payload: {
            response: finalResponse,
          },
        });
      };
    } else {
      getCurrentCallbackManager().dispatchEvent("llm-end", {
        payload: {
          response,
        },
      });
    }
    return response;
  };
}
