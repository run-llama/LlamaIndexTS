import { type Content as GeminiMessageContent } from "@google/generative-ai";

import { type GenerateContentResponse } from "@google-cloud/vertexai";
import type {
  ChatMessage,
  MessageContent,
  MessageContentImageDetail,
  MessageContentTextDetail,
  MessageType,
} from "../types.js";
import type {
  ChatContext,
  GeminiChatParamsNonStreaming,
  GeminiChatParamsStreaming,
  GeminiMessageRole,
  Part,
} from "./types.js";
export const getPartsText = (parts: Part[]): string => {
  const textStrings = [];
  if (parts.length) {
    for (const part of parts) {
      if (part.text) {
        textStrings.push(part.text);
      }
    }
  }
  if (textStrings.length > 0) {
    return textStrings.join("");
  } else {
    return "";
  }
};

/**
 * Returns all text found in all parts of first candidate.
 */
export const getText = (response: GenerateContentResponse): string => {
  if (response.candidates?.[0].content?.parts) {
    return getPartsText(response.candidates?.[0].content?.parts);
  }
  return "";
};

export const cleanParts = (
  message: GeminiMessageContent,
): GeminiMessageContent => {
  return {
    ...message,
    parts: message.parts.filter((part) => part.text?.trim()),
  };
};

export const getChatContext = (
  params: GeminiChatParamsStreaming | GeminiChatParamsNonStreaming,
): ChatContext => {
  // Gemini doesn't allow:
  // 1. Consecutive messages from the same role
  // 2. Parts that have empty text
  const messages = GeminiHelper.mergeNeighboringSameRoleMessages(
    params.messages.map(GeminiHelper.chatMessageToGemini),
  ).map(cleanParts);

  const history = messages.slice(0, -1);
  const message = messages[messages.length - 1].parts;
  return {
    history,
    message,
  };
};

/**
 * Helper class providing utility functions for Gemini
 */
export class GeminiHelper {
  // Gemini only has user and model roles. Put the rest in user role.
  public static readonly ROLES_TO_GEMINI: Record<
    MessageType,
    GeminiMessageRole
  > = {
    user: "user",
    system: "user",
    assistant: "model",
    memory: "user",
  };

  public static readonly ROLES_FROM_GEMINI: Record<
    GeminiMessageRole,
    MessageType
  > = {
    user: "user",
    model: "assistant",
  };

  public static mergeNeighboringSameRoleMessages(
    messages: GeminiMessageContent[],
  ): GeminiMessageContent[] {
    return messages.reduce(
      (
        result: GeminiMessageContent[],
        current: GeminiMessageContent,
        index: number,
      ) => {
        if (index > 0 && messages[index - 1].role === current.role) {
          result[result.length - 1].parts = [
            ...result[result.length - 1].parts,
            ...current.parts,
          ];
        } else {
          result.push(current);
        }
        return result;
      },
      [],
    );
  }

  public static messageContentToGeminiParts(content: MessageContent): Part[] {
    if (typeof content === "string") {
      return [{ text: content }];
    }

    const parts: Part[] = [];
    const imageContents = content.filter(
      (i) => i.type === "image_url",
    ) as MessageContentImageDetail[];
    parts.push(
      ...imageContents.map((i) => ({
        fileData: {
          mimeType: i.type,
          fileUri: i.image_url.url,
        },
      })),
    );
    const textContents = content.filter(
      (i) => i.type === "text",
    ) as MessageContentTextDetail[];
    parts.push(...textContents.map((t) => ({ text: t.text })));
    return parts;
  }

  public static chatMessageToGemini(
    message: ChatMessage,
  ): GeminiMessageContent {
    return {
      role: GeminiHelper.ROLES_TO_GEMINI[message.role],
      parts: GeminiHelper.messageContentToGeminiParts(message.content),
    };
  }
}
