import { type JSONValue } from "../global";
import type { ChatMessage, MessageContent } from "../llms";

/**
 * Serialize a message content to a JSON value.
 * @param message - The message content to serialize.
 * @returns The serialized message content.
 */
export function serializeMessageContent(message: MessageContent): JSONValue {
  if (typeof message === "string") {
    return message;
  }

  // message is an array of MessageContentDetail
  return message.map((detail) => {
    const serialized: { [key: string]: JSONValue } = {
      type: detail.type,
    };

    switch (detail.type) {
      case "text":
        serialized.text = detail.text;
        break;
      case "image_url":
        serialized.image_url = {
          url: detail.image_url.url,
        };
        if (detail.detail) {
          (serialized.image_url as { [key: string]: JSONValue }).detail =
            detail.detail;
        }
        break;
      case "audio":
        serialized.data = detail.data;
        serialized.mimeType = detail.mimeType;
        break;
      case "video":
        serialized.data = detail.data;
        serialized.mimeType = detail.mimeType;
        break;
      case "image":
        serialized.data = detail.data;
        serialized.mimeType = detail.mimeType;
        break;
      case "file":
        serialized.data = detail.data;
        serialized.mimeType = detail.mimeType;
        break;
      default:
        // For any unknown types, serialize all properties
        Object.assign(serialized, detail);
    }

    return serialized;
  });
}

/**
 * Serialize a chat message to a JSON value.
 * @param message - The chat message to serialize.
 * @returns The serialized chat message.
 */
export function serializeChatMessage(message: ChatMessage): JSONValue {
  const serialized: { [key: string]: JSONValue } = {
    content: serializeMessageContent(message.content),
    role: message.role,
  };

  if (message.options) {
    serialized.options = message.options as JSONValue;
  }

  return serialized;
}
