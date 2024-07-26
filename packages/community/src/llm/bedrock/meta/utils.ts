import type {
  BaseTool,
  ChatMessage,
  MessageContentTextDetail,
} from "@llamaindex/core/llms";
import type { MetaMessage } from "./types";

export const mapChatMessagesToMetaMessages = <T extends ChatMessage>(
  messages: T[],
): MetaMessage[] => {
  return messages.map((msg) => {
    let content: string = "";
    if (typeof msg.content === "string") {
      content = msg.content;
    } else if (msg.content.length) {
      content = (msg.content[0] as MessageContentTextDetail).text;
    }
    return {
      role:
        msg.role === "assistant"
          ? "assistant"
          : msg.role === "user"
            ? "user"
            : "system",
      content,
    };
  });
};

/**
 * Documentation at https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-3
 */
export const mapChatMessagesToMetaLlama3Messages = <T extends ChatMessage>(
  messages: T[],
  tools?: BaseTool[],
): string => {
  const mapped = mapChatMessagesToMetaMessages(messages).map((message) => {
    return [
      "<|start_header_id|>",
      message.role,
      "<|end_header_id|>",
      message.content,
      "<|eot_id|>",
    ].join("\n");
  });

  return [
    "<|begin_of_text|>",
    ...mapped,
    "<|start_header_id|>assistant<|end_header_id|>",
  ].join("\n");
};

/**
 * Documentation at https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-2
 */
export const mapChatMessagesToMetaLlama2Messages = <T extends ChatMessage>(
  messages: T[],
): string => {
  const mapped = mapChatMessagesToMetaMessages(messages);
  let output = "<s>";
  let insideInst = false;
  let needsStartAgain = false;
  for (const message of mapped) {
    if (needsStartAgain) {
      output += "<s>";
      needsStartAgain = false;
    }
    const text = message.content;
    if (message.role === "system") {
      if (!insideInst) {
        output += "[INST] ";
        insideInst = true;
      }
      output += `<<SYS>>\n${text}\n<</SYS>>\n`;
    } else if (message.role === "user") {
      output += text;
      if (insideInst) {
        output += " [/INST]";
        insideInst = false;
      }
    } else if (message.role === "assistant") {
      if (insideInst) {
        output += " [/INST]";
        insideInst = false;
      }
      output += ` ${text} </s>\n`;
      needsStartAgain = true;
    }
  }
  return output;
};
