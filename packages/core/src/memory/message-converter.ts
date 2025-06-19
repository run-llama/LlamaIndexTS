import { randomUUID } from "@llamaindex/env";
import type {
  ChatMessage,
  MessageContent,
  MessageContentDetail,
} from "../llms";
import { extractText } from "../utils";
import type { VercelMessage, VercelMessagePart } from "./types";

/**
 * Utility class for converting between LlamaIndex ChatMessage and Vercel UI Message formats
 */
export class VercelMessageAdapter {
  /**
   * Convert Vercel UI Message to LlamaIndex ChatMessage format
   */
  static toLlamaIndexMessage<AdditionalMessageOptions extends object = object>(
    uiMessage: VercelMessage,
  ): ChatMessage<AdditionalMessageOptions> {
    // Convert UI message role to MessageType
    let role: ChatMessage["role"];
    switch (uiMessage.role) {
      case "system":
      case "user":
      case "assistant":
        role = uiMessage.role;
        break;
      case "data":
        role = "user"; // Map data role to user
        break;
      default:
        role = "user"; // Default fallback, should not happen
    }

    // Convert parts to MessageContent
    const content = this.convertPartsToMessageContent(uiMessage.parts);

    return {
      content: content || uiMessage.content,
      role,
      options: undefined as unknown as AdditionalMessageOptions,
    };
  }

  /**
   * Convert LlamaIndex ChatMessage to Vercel UI Message format
   */
  static toUIMessage(llamaMessage: ChatMessage): VercelMessage {
    const parts: VercelMessagePart[] = this.convertMessageContentToParts(
      llamaMessage.content,
    );

    // Convert role to UI message role
    let role: VercelMessage["role"];
    switch (llamaMessage.role) {
      case "system":
      case "user":
      case "assistant":
        role = llamaMessage.role;
        break;
      case "memory":
        role = "system";
        break;
      case "developer":
        role = "user";
        break;
      default:
        role = "user"; // Default fallback, should not happen
    }

    return {
      id: randomUUID(),
      role,
      content: extractText(llamaMessage.content),
      parts,
      createdAt: new Date(),
      annotations: [],
    };
  }

  /**
   * Validate if object matches VercelMessage structure
   */
  static isVercelMessage(message: unknown): message is VercelMessage {
    if (!message || typeof message !== "object") {
      return false;
    }

    const msg = message as Record<string, unknown>;

    return (
      typeof msg.id === "string" &&
      typeof msg.role === "string" &&
      ["system", "user", "assistant", "data"].includes(msg.role as string) &&
      typeof msg.content === "string" &&
      Array.isArray(msg.parts)
    );
  }

  /**
   * Validate if object matches ChatMessage structure
   */
  static isLlamaIndexMessage(message: unknown): message is ChatMessage {
    if (!message || typeof message !== "object") {
      return false;
    }

    const msg = message as Record<string, unknown>;

    return (
      (typeof msg.content === "string" || Array.isArray(msg.content)) &&
      typeof msg.role === "string" &&
      ["user", "assistant", "system", "memory", "developer"].includes(
        msg.role as string,
      )
    );
  }

  /**
   * Convert UI parts to MessageContent
   */
  private static convertPartsToMessageContent(
    parts: VercelMessagePart[],
  ): MessageContent {
    if (parts.length === 0) {
      return "";
    }

    const details: MessageContentDetail[] = [];

    for (const part of parts) {
      switch (part.type) {
        case "file": {
          details.push({
            type: "file",
            data: part.data,
            mimeType: part.mimeType,
          });
          break;
        }
        default:
          // For other part types, convert to text
          details.push({
            type: "text",
            text: part.text,
          });
          break;
      }
    }

    // If only one text detail, return as string
    if (details.length === 1 && details[0]?.type === "text") {
      return details[0].text;
    }

    return details;
  }

  /**
   * Convert MessageContent to UI parts
   */
  private static convertMessageContentToParts(
    content: MessageContent,
  ): VercelMessagePart[] {
    if (typeof content === "string") {
      return [
        {
          type: "text",
          text: content,
        } as VercelMessagePart,
      ];
    }

    const parts: VercelMessagePart[] = [];

    for (const detail of content) {
      switch (detail.type) {
        case "text":
          parts.push({
            type: "text",
            text: detail.text,
          } as VercelMessagePart);
          break;
        case "image_url":
          parts.push({
            type: "text",
            text: `[Image URL: ${detail.image_url.url}]`,
          } as VercelMessagePart);
          break;
        case "audio":
        case "video":
        case "image":
        case "file":
          parts.push({
            type: "file",
            data: detail.data,
            mimeType: detail.type,
          } as VercelMessagePart);
          break;
        default:
          // For unknown types, create a text representation
          parts.push({
            type: "text",
            text: JSON.stringify(detail),
          } as VercelMessagePart);
      }
    }

    return parts;
  }
}
