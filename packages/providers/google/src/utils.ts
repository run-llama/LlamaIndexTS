import {
  createPartFromUri,
  type FunctionCall,
  FunctionResponse,
  type Content as GeminiMessage,
  GoogleGenAI,
  type Part,
} from "@google/genai";
import type { JSONObject } from "@llamaindex/core/global";
import type {
  ChatMessage,
  MessageContent,
  MessageContentDetail,
  PartialToolCall,
  ToolCall,
  ToolCallLLMMessageOptions,
  ToolResult,
} from "@llamaindex/core/llms";
import { getMimeTypeFromImageURL } from "@llamaindex/core/utils";
import { ROLES_TO_GEMINI } from "./constants.js";
import type { ChatContext, GeminiMessageRole } from "./types.js";

// Gemini doesn't allow:
// 1. Consecutive messages from the same role
// 2. Parts that have empty text
export const cleanParts = (message: GeminiMessage): GeminiMessage => {
  return {
    ...message,
    parts:
      message.parts?.filter(
        (part) =>
          part.text?.trim() ||
          part.inlineData ||
          part.fileData ||
          part.functionCall ||
          part.functionResponse,
      ) || [],
  };
};

export async function getChatContext(
  messages: ChatMessage<ToolCallLLMMessageOptions>[],
): Promise<ChatContext> {
  const geminiMessages = await Promise.all(
    messages.map(messageToGeminiMessage),
  );

  const mergedMessages =
    mergeNeighboringSameRoleMessages(geminiMessages).map(cleanParts);

  const history = mergedMessages.slice(0, -1);
  const message = mergedMessages[mergedMessages.length - 1]!.parts || [];
  return {
    history,
    message,
  };
}

function mergeNeighboringSameRoleMessages(
  messages: GeminiMessage[],
): GeminiMessage[] {
  return messages
    .map(cleanParts)
    .filter((message) => message.parts?.length)
    .reduce(
      (
        result: GeminiMessage[],
        current: GeminiMessage,
        index: number,
        original: GeminiMessage[],
      ) => {
        if (index > 0 && original[index - 1]!.role === current.role) {
          result[result.length - 1]!.parts = [
            ...(result[result.length - 1]?.parts || []),
            ...(current.parts || []),
          ];
        } else {
          result.push(current);
        }
        return result;
      },
      [],
    );
}

async function messageToGeminiMessage(
  message: ChatMessage<ToolCallLLMMessageOptions>,
): Promise<GeminiMessage> {
  return {
    role: messageToGeminiRole(message),
    parts: await messageToGeminiParts(message),
  };
}

function messageToGeminiRole(message: ChatMessage): GeminiMessageRole {
  if (message.options && "toolResult" in message.options) return "function";
  return ROLES_TO_GEMINI[message.role];
}

export async function messageToGeminiParts(
  message: ChatMessage<ToolCallLLMMessageOptions>,
): Promise<Part[]> {
  const { content, options } = message;

  if (options && "toolCall" in options) {
    return options.toolCall.map((call) => ({
      functionCall: toFunctionCall(call),
    }));
  }

  if (options && "toolResult" in options) {
    return [{ functionResponse: toFunctionResponse(options.toolResult) }];
  }

  const geminiParts = await messageContentToGeminiParts(content);

  return geminiParts;
}

export async function messageContentToGeminiParts(
  content: MessageContent,
): Promise<Part[]> {
  // if message content is a string, return a gemini text part
  if (typeof content === "string") return [{ text: content }];

  // if message content is an array of content details, convert each to a gemini part
  return await Promise.all(content.map(messageContentDetailToGeminiPart));
}

async function messageContentDetailToGeminiPart(
  content: MessageContentDetail,
): Promise<Part> {
  const ai = new GoogleGenAI({ apiKey: "GOOGLE_API_KEY" });

  // for text, just return the gemini text part
  if (content.type === "text") {
    return { text: content.text };
  }

  // for image has url already, extract mime type and create part from uri
  if (content.type === "image_url") {
    const uri = content.image_url.url;
    const mimeType = getMimeTypeFromImageURL(uri);
    if (!mimeType) {
      throw new Error(`Cannot extract mime type from image: ${uri}`);
    }
    return createPartFromUri(uri, mimeType);
  }

  // for the rest content types: [image(base64), audio, video, file]
  // upload it first and then create part from uri
  const result = await ai.files.upload({
    file: content.data, // use base64 data for upload
    config: { mimeType: content.mimeType },
  });

  if (result.error) {
    throw new Error(`Failed to upload file. Error: ${result.error}`);
  }

  if (!result.uri || !result.mimeType) {
    throw new Error(
      `File is uploaded successfully, but missing uri or mimeType. URI: ${result.uri}, MIME Type: ${result.mimeType}`,
    );
  }

  return createPartFromUri(result.uri, result.mimeType);
}

function toFunctionCall(call: ToolCall | PartialToolCall): FunctionCall {
  const { name, input } = call;

  if (typeof input === "string") {
    throw new Error(`Gemini function call input must be an object`);
  }

  return { name, args: input as JSONObject };
}

function toFunctionResponse(result: ToolResult): FunctionResponse {
  return {
    name: result.id,
    response: {
      result: result.result,
    },
  };
}
