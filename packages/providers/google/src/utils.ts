import {
  createPartFromUri,
  type Content as GeminiMessage,
  GoogleGenAI,
  type Part,
} from "@google/genai";
import type { MessageContentDetail } from "@llamaindex/core/llms";
import { getMimeTypeFromImageURL } from "@llamaindex/core/utils";

/**
 * Converts a MessageContentDetail object into a Google Gemini Part object.
 *
 * This function handles different content types appropriately for the Gemini API:
 * - Text content: Directly converts to Gemini text part
 * - Image URLs: Extracts MIME type and creates part from URI
 * - File/media content: Uploads to Google servers first, then creates part from uploaded URI
 *
 * @param content - The content to be converted (text, image URL, or base64 file data)
 * @param uploader - File upload function from Google GenAI library for uploading files to Google's servers
 *
 * @returns Promise that resolves to a Gemini-compatible Part object
 *
 * @throws {Error} When MIME type cannot be extracted from image URL
 * @throws {Error} When file upload fails
 * @throws {Error} When upload succeeds but URI or MIME type is missing from result
 */
export async function messageContentDetailToGeminiPart(
  content: MessageContentDetail,
  uploader: GoogleGenAI["files"]["upload"],
): Promise<Part> {
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

  // for the rest content types: image(base64), audio, video, file
  // upload it first and then create part from uri
  const result = await uploader({
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
