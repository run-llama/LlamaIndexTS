import { wrapEventCaller, wrapLLMEvent } from "@llamaindex/core/decorator";
import {
  ToolCallLLM,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
  type MessageContentTextDetail,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { extractText } from "@llamaindex/core/utils";
import {
  generateText,
  streamText,
  type CoreAssistantMessage,
  type CoreMessage,
  type CoreSystemMessage,
  type CoreToolMessage,
  type CoreUserMessage,
  type ImagePart,
  type LanguageModelV1,
  type TextPart,
} from "ai";

export type VercelAdditionalChatOptions = ToolCallLLMMessageOptions;

export class VercelLLM extends ToolCallLLM<VercelAdditionalChatOptions> {
  supportToolCall: boolean = true;
  private model: LanguageModelV1;

  constructor({ model }: { model: LanguageModelV1 }) {
    super();
    this.model = model;
  }

  get metadata(): LLMMetadata {
    return {
      model: this.model.modelId,
      temperature: 1,
      topP: 1,
      contextWindow: 128000,
      tokenizer: undefined,
      structuredOutput: false,
    };
  }

  private toVercelMessages(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): CoreMessage[] {
    return messages.map((message) => {
      const options = message.options ?? {};

      if ("toolResult" in options) {
        return {
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: options.toolResult.id,
              toolName: "", // XXX: tool result doesn't name
              isError: options.toolResult.isError,
              result: options.toolResult.result,
            },
          ],
        } satisfies CoreToolMessage;
      } else if ("toolCall" in options) {
        return {
          role: "assistant",
          content: options.toolCall.map((toolCall) => ({
            type: "tool-call",
            toolName: toolCall.name,
            toolCallId: toolCall.id,
            args: toolCall.input,
          })),
        } satisfies CoreAssistantMessage;
      }

      if (message.role === "system" || message.role === "assistant") {
        return {
          role: message.role,
          content: extractText(message.content),
        } satisfies CoreSystemMessage | CoreAssistantMessage;
      }

      if (message.role === "user") {
        return {
          role: message.role,
          content:
            typeof message.content === "string"
              ? message.content
              : message.content.map((contentDetail) => {
                  if (contentDetail.type === "image_url") {
                    return {
                      type: "image",
                      image: new URL(contentDetail.image_url.url),
                    } satisfies ImagePart;
                  }
                  return {
                    type: "text",
                    text: (contentDetail as MessageContentTextDetail).text,
                  } satisfies TextPart;
                }),
        } satisfies CoreUserMessage;
      }

      throw new Error(`Can not convert message ${JSON.stringify(message)}`);
    });
  }

  chat(
    params: LLMChatParamsStreaming<
      VercelAdditionalChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>>;
  chat(
    params: LLMChatParamsNonStreaming<
      VercelAdditionalChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<ChatResponse<ToolCallLLMMessageOptions>>;
  @wrapEventCaller
  @wrapLLMEvent
  async chat(
    params:
      | LLMChatParamsNonStreaming<
          VercelAdditionalChatOptions,
          ToolCallLLMMessageOptions
        >
      | LLMChatParamsStreaming<
          VercelAdditionalChatOptions,
          ToolCallLLMMessageOptions
        >,
  ): Promise<
    | ChatResponse<ToolCallLLMMessageOptions>
    | AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>
  > {
    const { messages, stream } = params;

    // Streaming
    if (stream) {
      const result = streamText({
        model: this.model,
        messages: this.toVercelMessages(messages),
      });
      return result.fullStream.pipeThrough(
        new TransformStream({
          async transform(message, controller): Promise<void> {
            switch (message.type) {
              case "text-delta":
                controller.enqueue({ raw: message, delta: message.textDelta });
            }
          },
        }),
      );
    }

    // Non-streaming
    const result = await generateText({
      model: this.model,
      messages: this.toVercelMessages(messages),
    });

    return {
      raw: result,
      message: {
        content: result.text,
        role: "assistant",
        options: result.toolCalls?.length
          ? {
              toolCall: result.toolCalls.map(
                ({ toolCallId, toolName, args }) => ({
                  id: toolCallId,
                  name: toolName,
                  input: args,
                }),
              ),
            }
          : {},
      },
    };
  }
}

/**
 * Convenience function to create a new VercelLLM instance.
 * @param init - initialization parameters for the VercelLLM instance.
 * @returns A new VercelLLM instance.
 */
export const vercel = (init: ConstructorParameters<typeof VercelLLM>[0]) =>
  new VercelLLM(init);
