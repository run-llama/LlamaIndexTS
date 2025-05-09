import type {
  Content,
  ContentListUnion,
  Part,
  Schema,
  ToolListUnion,
} from "@google/genai";
import type {
  BaseTool,
  ChatMessage,
  MessageContentDetail,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { extractDataUrlComponents } from "@llamaindex/core/utils";

import type { MessageContent } from "@llamaindex/core/llms";

export const mapMessageContentToMessageContentDetails = (
  content: MessageContent,
): MessageContentDetail[] => {
  return Array.isArray(content) ? content : [{ type: "text", text: content }];
};

const ACCEPTED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"];

export const mapTextPart = (text: string): Part => {
  return { text };
};

export const mapImagePart = (imageUrl: string): Part => {
  if (!imageUrl.startsWith("data:"))
    throw new Error(
      "For Google please only use base64 data url, e.g.: data:image/jpeg;base64,SGVsbG8sIFdvcmxkIQ==",
    );
  const { mimeType, base64: data } = extractDataUrlComponents(imageUrl);
  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(mimeType))
    throw new Error(
      `Anthropic only accepts the following mimeTypes: ${ACCEPTED_IMAGE_MIME_TYPES.join("\n")}`,
    );

  return {
    inlineData: {
      mimeType,
      data,
    },
  };
};

export const mapMessageContentDetailToGooglePart = <
  T extends MessageContentDetail,
>(
  detail: T,
): Part => {
  let part: Part;

  if (detail.type === "text") {
    part = mapTextPart(detail.text);
  } else if (detail.type === "image_url") {
    part = mapImagePart(detail.image_url.url);
  } else {
    throw new Error("Unsupported content detail type");
  }
  return part;
};
export const mapChatMessagesToGoogleFunctions = (
  tools: BaseTool[],
): ToolListUnion => {
  return [
    {
      functionDeclarations: tools.map((tool) => ({
        response: tool.metadata.parameters as Schema,
        description: tool.metadata.description,
        name: tool.metadata.name,
      })),
    },
  ];
};

export const mapChatMessagesToGoogleMessages = <
  T extends ChatMessage<ToolCallLLMMessageOptions>,
>(
  messages: T[],
): ContentListUnion => {
  const functionNames: Record<string, string> = {};
  messages.forEach((msg: T) => {
    if (msg.options && "toolCall" in msg.options) {
      const mapped = msg.options.toolCall.reduce(
        (result, item) => {
          result[item.id] = item.name;
          return result;
        },
        {} as Record<string, string>,
      );

      Object.assign(functionNames, mapped);
    }
  });

  // Transform messages to Google API format
  const contents = messages.flatMap((msg: T) => {
    if (msg.options && "toolResult" in msg.options) {
      return [
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: functionNames[msg.options.toolResult.id] ?? "",
                response: msg.options.toolResult,
              },
            },
          ],
        },
      ];
    }

    if (msg.options && "toolCall" in msg.options) {
      return [
        {
          role: "model",
          parts: msg.options.toolCall.map((call) => ({
            functionCall: {
              name: call.name,
              args: call.input as Record<string, unknown>,
            },
          })),
        },
      ];
    }

    const mapped = mapMessageContentToMessageContentDetails(msg.content)
      .map((detail: MessageContentDetail) => {
        const part = mapMessageContentDetailToGooglePart(detail);
        if (!part.text && !part.inlineData) return null;

        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [part],
        } as Content;
      })
      .filter((content): content is Content => content !== null);

    return mapped;
  });

  return contents;
};
