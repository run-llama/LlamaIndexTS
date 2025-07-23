import type {
  MessageContent,
  MessageContentDetail,
} from "@llamaindex/core/llms";

export const mapMessageContentToMessageContentDetails = (
  content: MessageContent,
): MessageContentDetail[] => {
  return Array.isArray(content) ? content : [{ type: "text", text: content }];
};
