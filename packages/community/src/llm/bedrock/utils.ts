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
