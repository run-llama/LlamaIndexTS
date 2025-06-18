import { randomUUID } from "@llamaindex/env";
import type {
  ChatMessage,
  MessageContent,
  MessageContentDetail,
} from "../llms";
import { extractText } from "../utils";
import type { UIMessage, UIPart } from "./types";

/**
 * Utility class for converting between LlamaIndex ChatMessage and Vercel UI Message formats
 */
export class MessageConverter {
  /**
   * Convert Vercel UI Message to LlamaIndex ChatMessage format
   */
  static toLlamaIndexMessage<AdditionalMessageOptions extends object = object>(
    uiMessage: UIMessage,
  ): ChatMessage<AdditionalMessageOptions> {
    // Convert UI message role to MessageType
    let role: ChatMessage["role"];
    switch (uiMessage.role) {
      case "system":
        role = "system";
        break;
      case "user":
        role = "user";
        break;
      case "assistant":
        role = "assistant";
        break;
      case "data":
        role = "system"; // Map data role to system
        break;
      default:
        role = "user"; // Default fallback
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
  static toUIMessage(llamaMessage: ChatMessage): UIMessage {
    const parts: UIPart[] = this.convertMessageContentToParts(
      llamaMessage.content,
    );

    // Convert role to UI message role
    let role: UIMessage["role"];
    switch (llamaMessage.role) {
      case "user":
        role = "user";
        break;
      case "assistant":
        role = "assistant";
        break;
      case "system":
      case "memory":
      case "developer":
        role = "system";
        break;
      default:
        role = "user";
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
   * Validate if object matches UIMessage structure
   */
  static isUIMessage(message: unknown): message is UIMessage {
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
  static isChatMessage(message: unknown): message is ChatMessage {
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
  private static convertPartsToMessageContent(parts: UIPart[]): MessageContent {
    if (parts.length === 0) {
      return "";
    }

    const details: MessageContentDetail[] = [];

    for (const part of parts) {
      switch (part.type) {
        case "text": {
          details.push({
            type: "text",
            text: part.content || "",
          });
          break;
        }
        case "tool": {
          const toolPart = part as unknown as UIPart;
          details.push({
            type: "text",
            text: `Tool: ${part.data?.toolName}`,
          });
          break;
        }
        case "reasoning": {
          const resultPart = part as unknown as UIPart;
          details.push({
            type: "text",
            text: `Result: ${JSON.stringify(part.data?.result)}`,
          });
          break;
        }
        default:
          // For other part types, convert to text
          details.push({
            type: "text",
            text: JSON.stringify(part),
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
  ): UIPart[] {
    if (typeof content === "string") {
      return [
        {
          type: "text",
          text: content,
        } as UIPart,
      ];
    }

    const parts: UIPart[] = [];

    for (const detail of content) {
      switch (detail.type) {
        case "text":
          parts.push({
            type: "text",
            text: detail.text,
          } as UIPart);
          break;
        case "image_url":
          // Convert image to text representation for UI
          parts.push({
            type: "text",
            text: `[Image: ${detail.image_url.url}]`,
          } as UIPart);
          break;
        case "audio":
          parts.push({
            type: "text",
            text: `[Audio: ${detail.mimeType}]`,
          } as UIPart);
          break;
        case "video":
          parts.push({
            type: "text",
            text: `[Video: ${detail.mimeType}]`,
          } as UIPart);
          break;
        case "image":
          parts.push({
            type: "text",
            text: `[Image: ${detail.mimeType}]`,
          } as UIPart);
          break;
        case "file":
          parts.push({
            type: "text",
            text: `[File: ${detail.mimeType}]`,
          } as UIPart);
          break;
        default:
          // For unknown types, create a text representation
          parts.push({
            type: "text",
            text: JSON.stringify(detail),
          } as UIPart);
      }
    }

    return parts;
  }
}
