import { randomUUID } from "@llamaindex/env";
import type {
  ChatMessage,
  MessageContent,
  MessageContentDetail,
} from "../../llms";
import { extractText } from "../../utils";
import type { MemoryMessage } from "../types";
import type { MessageAdapter } from "./base";

// UIMessage from the vercel/ai package (external)
export type VercelMessage = {
  id: string;
  role: "system" | "user" | "assistant" | "data";
  content: string;
  createdAt?: Date | undefined;
  annotations?: Array<unknown>;
  parts: Array<{ type: string; [key: string]: unknown }>;
};

/**
 * Additional ChatMessage.options for the vercel/ai format
 * useful for converting message
 */
export type VercelAIMessageOptions = {
  id?: string;
  createdAt?: Date;
  annotations?: Array<unknown>;
};

/**
 * Utility class for converting between LlamaIndex ChatMessage and Vercel UI Message formats
 */
export class VercelMessageAdapter implements MessageAdapter<VercelMessage> {
  /**
   * Convert LlamaIndex ChatMessage to Vercel UI Message format
   */
  fromLlamaIndex(memoryMessage: MemoryMessage): VercelMessage {
    const parts = this.convertMessageContentToVercelParts(
      memoryMessage.content,
    );

    // Convert role to UI message role
    let role: VercelMessage["role"];
    switch (memoryMessage.role) {
      case "system":
      case "user":
      case "assistant":
        role = memoryMessage.role;
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

    const options = memoryMessage.options as VercelAIMessageOptions;

    return {
      id: options?.id ?? randomUUID(),
      role,
      content: extractText(memoryMessage.content),
      parts,
      createdAt: options?.createdAt,
      annotations: options?.annotations ?? [],
    };
  }
  /**
   * Convert Vercel UI Message to LlamaIndex ChatMessage format
   */
  toLlamaIndex(uiMessage: VercelMessage): MemoryMessage {
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
    const content = this.convertVercelPartsToMessageContent(uiMessage.parts);

    return {
      content: content ?? uiMessage.content,
      role,
      options: {
        id: uiMessage.id,
        createdAt: uiMessage.createdAt,
        annotations: uiMessage.annotations,
      },
    };
  }

  /**
   * Validate if object matches VercelMessage structure
   */
  isCompatible(message: unknown): message is VercelMessage {
    return !!(
      message &&
      typeof message === "object" &&
      "role" in message &&
      "content" in message &&
      "parts" in message
    );
  }

  /**
   * Convert UI parts to MessageContent
   */
  private convertVercelPartsToMessageContent(
    parts: VercelMessage["parts"],
  ): MessageContent | null {
    if (parts.length === 0) {
      return null;
    }

    const details: MessageContentDetail[] = [];

    for (const part of parts) {
      switch (part.type) {
        case "file": {
          details.push({
            type: "file",
            data: part.data as string,
            mimeType: part.mimeType as string,
          });
          break;
        }
        default:
          // For other part types, convert to text
          details.push({
            type: "text",
            text: part.text as string,
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
  private convertMessageContentToVercelParts(
    content: MessageContent,
  ): VercelMessage["parts"] {
    if (typeof content === "string") {
      return [
        {
          type: "text",
          text: content,
        },
      ];
    }

    const parts: VercelMessage["parts"] = [];

    for (const detail of content) {
      switch (detail.type) {
        case "text":
          parts.push({
            type: "text",
            text: detail.text,
          });
          break;
        case "image_url":
          parts.push({
            type: "text",
            text: `[Image URL: ${detail.image_url.url}]`,
          });
          break;
        case "audio":
        case "video":
        case "image":
        case "file":
          parts.push({
            type: "file",
            data: detail.data,
            mimeType: detail.type,
          });
          break;
        default:
          // For unknown types, create a text representation
          parts.push({
            type: "text",
            text: JSON.stringify(detail),
          });
      }
    }

    return parts;
  }
}
