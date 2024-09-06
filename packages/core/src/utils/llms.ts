import type {
  ChatMessage,
  MessageContent,
  MessageContentDetail,
  MessageContentTextDetail, ToolMetadata
} from '../llms';
import type { QueryType } from "../query-engine";
import type { ImageType } from "../schema";

/**
 * Extracts just the text whether from
 *  a multi-modal message
 *  a single text message
 *  or a query
 *
 * @param message The message to extract text from.
 * @returns The extracted text
 */
export function extractText(message: MessageContent | QueryType): string {
  if (typeof message === "object" && "query" in message) {
    return extractText(message.query);
  }
  if (typeof message !== "string" && !Array.isArray(message)) {
    console.warn(
      "extractText called with non-MessageContent message, this is likely a bug.",
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

/**
 * Extracts a single text from a multi-modal message content
 *
 * @param message The message to extract images from.
 * @returns The extracted images
 */
export function extractSingleText(
  message: MessageContentDetail,
): string | null {
  if (message.type === "text") {
    return message.text;
  }
  return null;
}

/**
 * Extracts an image from a multi-modal message content
 *
 * @param message The message to extract images from.
 * @returns The extracted images
 */
export function extractImage(message: MessageContentDetail): ImageType | null {
  if (message.type === "image_url") {
    return new URL(message.image_url.url);
  }
  return null;
}

export const extractDataUrlComponents = (
  dataUrl: string,
): {
  mimeType: string;
  base64: string;
} => {
  const parts = dataUrl.split(";base64,");

  if (parts.length !== 2 || !parts[0].startsWith("data:")) {
    throw new Error("Invalid data URL");
  }

  const mimeType = parts[0].slice(5);
  const base64 = parts[1];

  return {
    mimeType,
    base64,
  };
};

export function messagesToHistory(messages: ChatMessage[]): string {
  return messages.reduce((acc, message) => {
    acc += acc ? "\n" : "";
    if (message.role === "user") {
      acc += `Human: ${message.content}`;
    } else {
      acc += `Assistant: ${message.content}`;
    }
    return acc;
  }, "");
}

export function toToolDescriptions(tools: ToolMetadata[]): string {
  const toolsObj = tools.reduce<Record<string, string>>((acc, tool) => {
    acc[tool.name] = tool.description;
    return acc;
  }, {});

  return JSON.stringify(toolsObj, null, 4);
}