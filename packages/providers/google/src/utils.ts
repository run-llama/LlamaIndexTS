import {
  createPartFromUri,
  type FunctionDeclaration,
  type Content as GeminiMessage,
  GoogleGenAI,
  Modality,
  type Part,
  type Schema,
  Type,
} from "@google/genai";
import type { BaseTool, MessageContentDetail } from "@llamaindex/core/llms";
import { ModalityType } from "@llamaindex/core/schema";
import { base64ToBlob } from "@llamaindex/core/utils";

export const mapBaseToolToGeminiFunctionDeclaration = (
  tool: BaseTool,
): FunctionDeclaration => {
  const { name, description, parameters } = tool.metadata;
  return {
    name,
    description,
    parameters: {
      type: parameters?.type.toLowerCase() as Type,
      properties: parameters?.properties,
      description: parameters?.description,
      required: parameters?.required,
    },
  };
};

/**
 * Maps a BaseTool to a Gemini Live Function Declaration format
 * Used for converting LlamaIndex tools to be compatible with Gemini's live API function calling
 *
 * @param tool - The BaseTool to convert
 * @returns A LiveFunctionDeclaration object that can be used with Gemini's live API
 */
export function mapBaseToolToGeminiLiveFunctionDeclaration(
  tool: BaseTool,
): FunctionDeclaration {
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
}

export function mapResponseModalityToGeminiLiveResponseModality(
  responseModality: ModalityType,
): Modality {
  return responseModality === ModalityType.TEXT
    ? Modality.TEXT
    : responseModality === ModalityType.AUDIO
      ? Modality.AUDIO
      : Modality.IMAGE;
}

// Gemini doesn't allow consecutive messages from the same role, so we need to merge them
export function mergeNeighboringSameRoleMessages(
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

/**
 * Converts a MessageContentDetail object into a Google Gemini Part object.
 *
 * This function handles different content types appropriately for the Gemini API:
 * - Text content: Directly converts to Gemini text part
 * - Image URLs: Extracts MIME type and creates part from URI
 * - File/media content: Uploads to Google servers first, then creates part from uploaded URI
 *
 * @param content - The content to be converted (text, image URL, or base64 file data)
 * @param client - Google GenAI client
 *
 * @returns Promise that resolves to a Gemini-compatible Part object
 *
 * @throws {Error} When MIME type cannot be extracted from image URL
 * @throws {Error} When file upload fails
 * @throws {Error} When upload succeeds but URI or MIME type is missing from result
 */
export async function messageContentDetailToGeminiPart(
  content: MessageContentDetail,
  client: GoogleGenAI,
): Promise<Part> {
  // for text, just return the gemini text part
  if (content.type === "text") {
    return { text: content.text };
  }

  // for image has url already, extract mime type and create part from uri
  if (content.type === "image_url") {
    throw new Error(
      "URL-based images are not supported in Gemini, please use type='image' for base64-encoded images instead",
    );
  }

  // for the rest content types: image(base64), audio, video, file
  // upload it first and then create part from uri
  const result = await client.files.upload({
    file: base64ToBlob(content.data, content.mimeType), // convert base64 to blob for upload
    config: { mimeType: content.mimeType },
  });

  if (result.error) {
    throw new Error(`Failed to upload file`);
  }

  if (!result.uri || !result.mimeType) {
    throw new Error(
      `File is uploaded successfully, but missing uri or mimeType. URI: ${result.uri}, MIME Type: ${result.mimeType}`,
    );
  }

  return createPartFromUri(result.uri, result.mimeType);
}

// Gemini doesn't allow parts that have empty text, so we need to clean them
function cleanParts(message: GeminiMessage): GeminiMessage {
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
}
