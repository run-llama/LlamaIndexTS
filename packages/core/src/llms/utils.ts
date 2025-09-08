import type {
  ChatMessage,
  MessageContentImageDataDetail,
  MessageContentTextDetail,
} from "./type";

export function addContentPart<AdditionalMessageOptions extends object>(
  message: ChatMessage<AdditionalMessageOptions>,
  part: MessageContentTextDetail | MessageContentImageDataDetail,
): void {
  if (part.type === "text") {
    if (typeof message.content === "string") {
      message.content += part.text;
    } else {
      message.content.push(part);
    }
  } else {
    if (typeof message.content === "string") {
      if (message.content === "") {
        message.content = [part];
      } else {
        message.content = [{ type: "text", text: message.content }, part];
      }
    } else {
      message.content.push(part);
    }
  }
}
