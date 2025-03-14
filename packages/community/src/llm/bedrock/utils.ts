import type {
  MessageContent,
  MessageContentDetail,
} from "@llamaindex/core/llms";

export const mapMessageContentToMessageContentDetails = (
  content: MessageContent,
): MessageContentDetail[] => {
  return Array.isArray(content) ? content : [{ type: "text", text: content }];
};

export const toUtf8 = (input: Uint8Array): string =>
  new TextDecoder("utf-8").decode(input);

export const extractDataUrlComponents = (
  dataUrl: string,
): {
  mimeType: string;
  base64: string;
} => {
  const parts = dataUrl.split(";base64,");

  if (parts.length !== 2 || !parts[0]!.startsWith("data:")) {
    throw new Error("Invalid data URL");
  }

  const mimeType = parts[0]!.slice(5);
  const base64 = parts[1]!;

  return {
    mimeType,
    base64,
  };
};
