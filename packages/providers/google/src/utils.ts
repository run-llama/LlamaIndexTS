import { type GenerateContentResponse } from "@google-cloud/vertexai";
import {
  type FunctionDeclaration as LiveFunctionDeclaration,
  Modality,
  type Schema,
  Type,
} from "@google/genai";
import {
  type FunctionCall,
  type Content as GeminiMessageContent,
  HarmBlockThreshold,
  HarmCategory,
  type SafetySetting,
  SchemaType,
} from "@google/generative-ai";
import { FileState, GoogleAIFileManager } from "@google/generative-ai/server";
import type {
  BaseTool,
  ChatMessage,
  MessageContentFileDetail,
  MessageContentImageDetail,
  MessageContentTextDetail,
  MessageType,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { ModalityType } from "@llamaindex/core/schema";
import { extractDataUrlComponents } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import type {
  ChatContext,
  FileDataPart,
  FunctionDeclaration,
  FunctionDeclarationSchema,
  GeminiChatParamsNonStreaming,
  GeminiChatParamsStreaming,
  GeminiMessageRole,
  InlineDataPart,
  Part,
} from "./types.js";

const FILE_EXT_MIME_TYPES: { [key: string]: string } = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};
const ACCEPTED_IMAGE_MIME_TYPES = Object.values(FILE_EXT_MIME_TYPES);

const getFileURLExtension = (url: string): string | null => {
  const pathname = new URL(url).pathname;
  const parts = pathname.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || null : null;
};

const getFileURLMimeType = (url: string): string | null => {
  const ext = getFileURLExtension(url);
  return ext ? FILE_EXT_MIME_TYPES[ext] || null : null;
};

const getImageParts = (
  message: MessageContentImageDetail,
): InlineDataPart | FileDataPart => {
  if (message.image_url.url.startsWith("data:")) {
    const { mimeType, base64: data } = extractDataUrlComponents(
      message.image_url.url,
    );
    if (!mimeType || !ACCEPTED_IMAGE_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Gemini only accepts the following mimeTypes: ${ACCEPTED_IMAGE_MIME_TYPES.join(
          "\n",
        )}`,
      );
    }
    return {
      inlineData: {
        mimeType,
        data,
      },
    };
  }
  const mimeType = getFileURLMimeType(message.image_url.url);
  if (!mimeType || !ACCEPTED_IMAGE_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Gemini only accepts the following mimeTypes: ${ACCEPTED_IMAGE_MIME_TYPES.join(
        "\n",
      )}`,
    );
  }
  return {
    fileData: { mimeType, fileUri: message.image_url.url },
  };
};

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
  if (response.candidates?.[0]!.content?.parts) {
    return getPartsText(response.candidates?.[0].content?.parts);
  }
  return "";
};

export const cleanParts = (
  message: GeminiMessageContent,
): GeminiMessageContent => {
  return {
    ...message,
    parts: message.parts.filter(
      (part) =>
        part.text?.trim() ||
        part.inlineData ||
        part.fileData ||
        part.functionCall ||
        part.functionResponse,
    ),
  };
};

export const getChatContext = async (
  params: GeminiChatParamsStreaming | GeminiChatParamsNonStreaming,
): Promise<ChatContext> => {
  // Gemini doesn't allow:
  // 1. Consecutive messages from the same role
  // 2. Parts that have empty text
  const fnMap = params.messages.reduce(
    (result, message) => {
      if (message.options && "toolCall" in message.options) {
        message.options.toolCall.forEach((call) => {
          result[call.id] = call.name;
        });
      }

      return result;
    },
    {} as Record<string, string>,
  );
  const messages = GeminiHelper.mergeNeighboringSameRoleMessages(
    await Promise.all(
      params.messages.map((message) =>
        GeminiHelper.chatMessageToGemini(message, fnMap),
      ),
    ),
  ).map(cleanParts);

  const history = messages.slice(0, -1);
  const message = messages[messages.length - 1]!.parts;
  return {
    history,
    message,
  };
};

export const mapBaseToolToGeminiFunctionDeclaration = (
  tool: BaseTool,
): FunctionDeclaration => {
  const parameters: FunctionDeclarationSchema = {
    type: tool.metadata.parameters?.type.toLowerCase() as SchemaType,
    properties: tool.metadata.parameters?.properties,
    description: tool.metadata.parameters?.description,
    required: tool.metadata.parameters?.required,
  };

  return {
    name: tool.metadata.name,
    description: tool.metadata.description,
    parameters,
  };
};

/**
 * Maps a BaseTool to a Gemini Live Function Declaration format
 * Used for converting LlamaIndex tools to be compatible with Gemini's live API function calling
 *
 * @param tool - The BaseTool to convert
 * @returns A LiveFunctionDeclaration object that can be used with Gemini's live API
 */
export const mapBaseToolToGeminiLiveFunctionDeclaration = (
  tool: BaseTool,
): LiveFunctionDeclaration => {
  const parameters: Schema = {
    type: tool.metadata.parameters?.type.toLowerCase() as Type,
    properties: tool.metadata.parameters?.properties,
    description: tool.metadata.parameters?.description,
    required: tool.metadata.parameters?.required,
  };
  return {
    name: tool.metadata.name,
    description: tool.metadata.description,
    parameters,
  };
};

export const mapResponseModalityToGeminiLiveResponseModality = (
  responseModality: ModalityType,
): Modality => {
  return responseModality === ModalityType.TEXT
    ? Modality.TEXT
    : responseModality === ModalityType.AUDIO
      ? Modality.AUDIO
      : Modality.IMAGE;
};

/**
 * Helper class providing utility functions for Gemini
 */
export class GeminiHelper {
  // Gemini only has user and model roles. Put the rest in user role.
  public static readonly ROLES_TO_GEMINI: Record<
    Exclude<MessageType, "developer">,
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
    function: "user",
  };

  public static mergeNeighboringSameRoleMessages(
    messages: GeminiMessageContent[],
  ): GeminiMessageContent[] {
    return messages
      .map(cleanParts)
      .filter((message) => message.parts.length)
      .reduce(
        (
          result: GeminiMessageContent[],
          current: GeminiMessageContent,
          index: number,
          original: GeminiMessageContent[],
        ) => {
          if (index > 0 && original[index - 1]!.role === current.role) {
            result[result.length - 1]!.parts = [
              ...result[result.length - 1]!.parts,
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

  public static async messageContentToGeminiParts({
    content,
    options = undefined,
    fnMap = undefined,
  }: Pick<ChatMessage<ToolCallLLMMessageOptions>, "content" | "options"> & {
    fnMap?: Record<string, string>;
  }): Promise<Part[]> {
    if (options && "toolResult" in options) {
      if (!fnMap) throw Error("fnMap must be set");
      const name = fnMap[options.toolResult.id];
      if (!name) {
        throw Error(
          `Could not find the name for fn call with id ${options.toolResult.id}`,
        );
      }

      return [
        {
          functionResponse: {
            name,
            response: {
              result: options.toolResult.result,
            },
          },
        },
      ];
    }
    if (options && "toolCall" in options) {
      return options.toolCall.map((call) => ({
        functionCall: {
          name: call.name,
          args: call.input,
        } as FunctionCall,
      }));
    }
    if (typeof content === "string") {
      return [{ text: content }];
    }

    const parts: Part[] = [];
    const imageContents = content.filter(
      (i) => i.type === "image_url",
    ) as MessageContentImageDetail[];

    parts.push(...imageContents.map(getImageParts));

    const textContents = content.filter(
      (i) => i.type === "text",
    ) as MessageContentTextDetail[];
    parts.push(...textContents.map((t) => ({ text: t.text })));

    const fileContents = content.filter(
      (i) => i.type === "file",
    ) as MessageContentFileDetail[];

    if (fileContents.length > 0) {
      for (const file of fileContents) {
        const uploadResponse = await GeminiHelper.uploadFile(
          file.data,
          file.mimeType,
        );
        parts.push({
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        });
      }
    }

    return parts;
  }

  // Upload a file for AI processing
  public static async uploadFile(
    data: string | Buffer, // file name or buffer
    mimeType: string, // eg. application/pdf
    interval = 5_000, // time to refetch upload status
  ) {
    const fileManager = new GoogleAIFileManager(getEnv("GOOGLE_API_KEY")!);

    const uploadResponse = await fileManager.uploadFile(data, { mimeType });

    let file = await fileManager.getFile(uploadResponse.file.name);

    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      file = await fileManager.getFile(uploadResponse.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Failed to upload file");
    }

    return uploadResponse;
  }

  public static getGeminiMessageRole(
    message: ChatMessage<ToolCallLLMMessageOptions>,
  ): GeminiMessageRole {
    if (message.options && "toolResult" in message.options) {
      return "function";
    }
    return GeminiHelper.ROLES_TO_GEMINI[
      message.role as Exclude<MessageType, "developer">
    ];
  }

  public static async chatMessageToGemini(
    message: ChatMessage<ToolCallLLMMessageOptions>,
    fnMap: Record<string, string>, // mapping of fn call id to fn call name
  ): Promise<GeminiMessageContent> {
    return {
      role: GeminiHelper.getGeminiMessageRole(message),
      parts: await GeminiHelper.messageContentToGeminiParts({
        ...message,
        fnMap,
      }),
    };
  }
}

/**
 * Returns functionCall of first candidate.
 * Taken from https://github.com/google-gemini/generative-ai-js/ to be used with
 * vertexai as that library doesn't include it
 */
export function getFunctionCalls(
  response: GenerateContentResponse,
): FunctionCall[] | undefined {
  const functionCalls: FunctionCall[] = [];
  if (response.candidates?.[0]!.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }
  }
  if (functionCalls.length > 0) {
    return functionCalls;
  } else {
    return undefined;
  }
}

/**
 * Safety settings to disable external filters
 * Documentation: https://ai.google.dev/gemini-api/docs/safety-settings
 */
export const DEFAULT_SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];
