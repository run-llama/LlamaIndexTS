import { wrapEventCaller, wrapLLMEvent } from "@llamaindex/core/decorator";
import {
  ToolCallLLM,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { extractText } from "@llamaindex/core/utils";
import {
  generateText,
  streamText,
  type AssistantModelMessage,
  type CoreUserMessage,
  type ImagePart,
  type LanguageModel,
  type ModelMessage,
  type SystemModelMessage,
  type TextPart,
  type ToolModelMessage,
} from "ai";

export type VercelAdditionalChatOptions = ToolCallLLMMessageOptions;

export class VercelLLM extends ToolCallLLM<VercelAdditionalChatOptions> {
  supportToolCall: boolean = true;
  private model: LanguageModel;

  constructor({ model }: { model: LanguageModel }) {
    super();
    this.model = model;
  }

  get metadata(): LLMMetadata {
    return {
      model: this.model.toString(),
      temperature: 1,
      topP: 1,
      contextWindow: 128000,
      tokenizer: undefined,
      structuredOutput: false,
    };
  }

  private toVercelMessages(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): ModelMessage[] {
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
              output: options.toolResult.isError
                ? {
                    type: "error-text",
                    value: options.toolResult.result,
                  }
                : {
                    type: "text",
                    value: options.toolResult.result,
                  },
            },
          ],
        } satisfies ToolModelMessage;
      } else if ("toolCall" in options) {
        return {
          role: "assistant",
          content: options.toolCall.map((toolCall) => ({
            type: "tool-call",
            toolName: toolCall.name,
            toolCallId: toolCall.id,
            input: toolCall.input,
          })),
        } satisfies AssistantModelMessage;
      }

      if (message.role === "system" || message.role === "assistant") {
        return {
          role: message.role,
          content: extractText(message.content),
        } satisfies SystemModelMessage | AssistantModelMessage;
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
                  if (contentDetail.type === "file") {
                    throw new Error("File content not supported yet");
                  }
                  if (contentDetail.type === "text") {
                    return {
                      type: "text",
                      text: contentDetail.text,
                    } satisfies TextPart;
                  }
                  throw new Error(
                    `Unsupported content type: ${contentDetail.type}`,
                  );
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
                controller.enqueue({ raw: message, delta: message.text });
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
                ({ toolCallId, toolName, input }) => ({
                  id: toolCallId,
                  name: toolName,
                  input,
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
