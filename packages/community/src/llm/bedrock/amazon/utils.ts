import type {
  ImageBlock,
  ImageFormat,
  Message,
  Tool,
} from "@aws-sdk/client-bedrock-runtime";
import type {
  BaseTool,
  ChatMessage,
  MessageContentDetail,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import {
  extractDataUrlComponents,
  mapMessageContentToMessageContentDetails,
} from "../utils";

import type { JSONObject } from "@llamaindex/core/global";
import type { AmazonMessage, AmazonMessages } from "./types";

const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const ACCEPTED_IMAGE_MIME_TYPE_FORMAT_MAP: Record<
  (typeof ACCEPTED_IMAGE_MIME_TYPES)[number],
  ImageFormat
> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const mapImageContent = (imageUrl: string): ImageBlock => {
  if (!imageUrl.startsWith("data:"))
    throw new Error(
      "For Amazon please only use base64 data url, e.g.: data:image/jpeg;base64,SGVsbG8sIFdvcmxkIQ==",
    );
  const { mimeType, base64: data } = extractDataUrlComponents(imageUrl);
  if (
    !ACCEPTED_IMAGE_MIME_TYPES.includes(
      mimeType as keyof typeof ACCEPTED_IMAGE_MIME_TYPE_FORMAT_MAP,
    )
  )
    throw new Error(
      `Amazon only accepts the following mimeTypes: ${ACCEPTED_IMAGE_MIME_TYPES.join("\n")}`,
    );

  return {
    format:
      ACCEPTED_IMAGE_MIME_TYPE_FORMAT_MAP[
        mimeType as keyof typeof ACCEPTED_IMAGE_MIME_TYPE_FORMAT_MAP
      ],

    // @ts-expect-error: there's a mistake in the "@aws-sdk/client-bedrock-runtime" compared to the actual api
    source: { bytes: data },
  };
};

export const mapMessageContentDetailToAmazonContent = <
  T extends MessageContentDetail,
>(
  detail: T,
): Message["content"] => {
  let content: Message["content"] = [];

  if (detail.type === "text") {
    content = [{ text: detail.text }];
  } else if (detail.type === "image_url") {
    content = [{ image: mapImageContent(detail.image_url.url) }];
  } else {
    throw new Error("Unsupported content detail type");
  }
  return content;
};

export const mapChatMessagesToAmazonMessages = <
  T extends ChatMessage<ToolCallLLMMessageOptions>,
>(
  messages: T[],
): AmazonMessages => {
  return messages.flatMap((msg: T): AmazonMessage[] => {
    return mapMessageContentToMessageContentDetails(msg.content).map(
      (detail: MessageContentDetail): AmazonMessage => {
        if (msg.options && "toolCall" in msg.options) {
          return {
            role: "assistant",
            content: msg.options.toolCall.map((call) => ({
              toolUse: {
                toolUseId: call.id,
                name: call.name,
                input: call.input as JSONObject,
              },
            })),
          };
        }
        if (msg.options && "toolResult" in msg.options) {
          return {
            role: "user",
            content: [
              {
                toolResult: {
                  toolUseId: msg.options.toolResult.id,
                  content: [
                    {
                      text: msg.options.toolResult.result,
                    },
                  ],
                },
              },
            ],
          };
        }

        return {
          role: msg.role === "assistant" ? "assistant" : "user",
          content: mapMessageContentDetailToAmazonContent(detail),
        };
      },
    );
  });
};

export const mapBaseToolsToAmazonTools = (tools?: BaseTool[]): Tool[] => {
  if (!tools) return [];
  return tools.map((tool: BaseTool) => {
    const {
      metadata: { parameters, ...options },
    } = tool;
    return {
      toolSpec: {
        ...options,
        inputSchema: parameters,
      },
    } as Tool;
  });
};
