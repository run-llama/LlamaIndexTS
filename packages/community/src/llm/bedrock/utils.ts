import type {
  ChatMessage,
  MessageContent,
  MessageContentDetail,
  MessageContentTextDetail,
} from "llamaindex";
import type {
  AnthropicContent,
  AnthropicImageContent,
  AnthropicMediaTypes,
  AnthropicMessage,
  AnthropicTextContent,
  MetaMessage,
} from "./types.js";

const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const mapMessageContentToMessageContentDetails = (
  content: MessageContent,
): MessageContentDetail[] => {
  return Array.isArray(content) ? content : [{ type: "text", text: content }];
};

export const mergeNeighboringSameRoleMessages = (
  messages: AnthropicMessage[],
): AnthropicMessage[] => {
  return messages.reduce(
    (result: AnthropicMessage[], current: AnthropicMessage, index: number) => {
      if (index > 0 && messages[index - 1].role === current.role) {
        result[result.length - 1].content = [
          ...result[result.length - 1].content,
          ...current.content,
        ];
      } else {
        result.push(current);
      }
      return result;
    },
    [],
  );
};

export const mapMessageContentDetailToAnthropicContent = <
  T extends MessageContentDetail,
>(
  detail: T,
): AnthropicContent => {
  let content: AnthropicContent;

  if (detail.type === "text") {
    content = mapTextContent(detail.text);
  } else if (detail.type === "image_url") {
    content = mapImageContent(detail.image_url.url);
  } else {
    throw new Error("Unsupported content detail type");
  }
  return content;
};

export const mapMessageContentToAnthropicContent = <T extends MessageContent>(
  content: T,
): AnthropicContent[] => {
  return mapMessageContentToMessageContentDetails(content).map(
    mapMessageContentDetailToAnthropicContent,
  );
};

export const mapChatMessagesToAnthropicMessages = <T extends ChatMessage>(
  messages: T[],
): AnthropicMessage[] => {
  const mapped = messages
    .flatMap((msg: T): AnthropicMessage[] => {
      return mapMessageContentToMessageContentDetails(msg.content).map(
        (detail: MessageContentDetail): AnthropicMessage => {
          const content = mapMessageContentDetailToAnthropicContent(detail);

          return {
            role: msg.role === "assistant" ? "assistant" : "user",
            content: [content],
          };
        },
      );
    })
    .filter((message: AnthropicMessage) => {
      const content = message.content[0];
      if (content.type === "text" && !content.text) return false;
      if (content.type === "image" && !content.source.data) return false;
      return true;
    });

  return mergeNeighboringSameRoleMessages(mapped);
};

export const mapChatMessagesToMetaMessages = <T extends ChatMessage>(
  messages: T[],
): MetaMessage[] => {
  return messages.map((msg) => {
    let content: string;
    if (typeof msg.content === "string") {
      content = msg.content;
    } else {
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
): string => {
  const mapped = mapChatMessagesToMetaMessages(messages).map((message) => {
    const text = message.content;
    return `<|start_header_id|>${message.role}<|end_header_id|>\n${text}\n<|eot_id|>\n`;
  });
  return (
    "<|begin_of_text|>" +
    mapped.join("\n") +
    "\n<|start_header_id|>assistant<|end_header_id|>\n"
  );
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
  debugger;
  return output;
};

export const mapTextContent = (text: string): AnthropicTextContent => {
  return { type: "text", text };
};

export const extractDataUrlComponents = (
  dataUrl: string,
): {
  mimeType: string;
  base64: string;
} => {
  const parts = dataUrl.split(";base64,");

  if (parts.length !== 2 || !parts[0].startsWith("data:")) {
    throw new Error("Invalid data URL");
  }

  const mimeType = parts[0].slice(5);
  const base64 = parts[1];

  return {
    mimeType,
    base64,
  };
};

export const mapImageContent = (imageUrl: string): AnthropicImageContent => {
  if (!imageUrl.startsWith("data:"))
    throw new Error(
      "For Anthropic please only use base64 data url, e.g.: data:image/jpeg;base64,SGVsbG8sIFdvcmxkIQ==",
    );
  const { mimeType, base64: data } = extractDataUrlComponents(imageUrl);
  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(mimeType))
    throw new Error(
      `Anthropic only accepts the following mimeTypes: ${ACCEPTED_IMAGE_MIME_TYPES.join("\n")}`,
    );

  return {
    type: "image",
    source: {
      type: "base64",
      media_type: mimeType as AnthropicMediaTypes,
      data,
    },
  };
};

export const toUtf8 = (input: Uint8Array): string =>
  new TextDecoder("utf-8").decode(input);
