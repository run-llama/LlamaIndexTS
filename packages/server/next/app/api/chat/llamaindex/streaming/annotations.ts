import { JSONValue, Message } from "ai";
import {
  ChatMessage,
  MessageContent,
  MessageContentDetail,
  MessageType,
} from "llamaindex";
import { UPLOADED_FOLDER } from "../documents/helper";

export type DocumentFileType = "csv" | "pdf" | "txt" | "docx";

export type DocumentFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  refs?: string[];
};

type Annotation = {
  type: string;
  data: object;
};

export function isValidMessages(messages: Message[]): boolean {
  const lastMessage =
    messages && messages.length > 0 ? messages[messages.length - 1] : null;
  return lastMessage !== null && lastMessage.role === "user";
}

export function retrieveDocumentIds(messages: Message[]): string[] {
  // retrieve document Ids from the annotations of all messages (if any)
  const documentFiles = retrieveDocumentFiles(messages);
  return documentFiles.map((file) => file.refs || []).flat();
}

export function retrieveDocumentFiles(messages: Message[]): DocumentFile[] {
  const annotations = getAllAnnotations(messages);
  if (annotations.length === 0) return [];

  const files: DocumentFile[] = [];
  for (const { type, data } of annotations) {
    if (
      type === "document_file" &&
      "files" in data &&
      Array.isArray(data.files)
    ) {
      files.push(...data.files);
    }
  }
  return files;
}

export function retrieveMessageContent(messages: Message[]): MessageContent {
  const userMessage = messages[messages.length - 1];
  return [
    {
      type: "text",
      text: userMessage.content,
    },
    ...retrieveLatestArtifact(messages),
    ...convertAnnotations(messages),
  ];
}

export function convertToChatHistory(messages: Message[]): ChatMessage[] {
  if (!messages || !Array.isArray(messages)) {
    return [];
  }
  const agentHistory = retrieveAgentHistoryMessage(messages);
  if (agentHistory) {
    const previousMessages = messages.slice(0, -1);
    return [...previousMessages, agentHistory].map((msg) => ({
      role: msg.role as MessageType,
      content: msg.content,
    }));
  }
  return messages.map((msg) => ({
    role: msg.role as MessageType,
    content: msg.content,
  }));
}

function retrieveAgentHistoryMessage(
  messages: Message[],
  maxAgentMessages = 10,
): ChatMessage | null {
  const agentAnnotations = getAnnotations<{ agent: string; text: string }>(
    messages,
    { role: "assistant", type: "agent" },
  ).slice(-maxAgentMessages);

  if (agentAnnotations.length > 0) {
    const messageContent =
      "Here is the previous conversation of agents:\n" +
      agentAnnotations.map((annotation) => annotation.data.text).join("\n");
    return {
      role: "assistant",
      content: messageContent,
    };
  }
  return null;
}

function getFileContent(file: DocumentFile): string {
  let defaultContent = `=====File: ${file.name}=====\n`;
  // Include file URL if it's available
  const urlPrefix = process.env.FILESERVER_URL_PREFIX;
  let urlContent = "";
  if (urlPrefix) {
    if (file.url) {
      urlContent = `File URL: ${file.url}\n`;
    } else {
      urlContent = `File URL (instruction: do not update this file URL yourself): ${urlPrefix}/output/uploaded/${file.name}\n`;
    }
  } else {
    console.warn(
      "Warning: FILESERVER_URL_PREFIX not set in environment variables. Can't use file server",
    );
  }
  defaultContent += urlContent;

  // Include document IDs if it's available
  if (file.refs) {
    defaultContent += `Document IDs: ${file.refs}\n`;
  }
  // Include sandbox file paths
  const sandboxFilePath = `/tmp/${file.name}`;
  defaultContent += `Sandbox file path (instruction: only use sandbox path for artifact or code interpreter tool): ${sandboxFilePath}\n`;

  // Include local file path
  const localFilePath = `${UPLOADED_FOLDER}/${file.name}`;
  defaultContent += `Local file path (instruction: use for local tool that requires a local path): ${localFilePath}\n`;

  return defaultContent;
}

function getAllAnnotations(messages: Message[]): Annotation[] {
  return messages.flatMap((message) =>
    (message.annotations ?? []).map((annotation) =>
      getValidAnnotation(annotation),
    ),
  );
}

// get latest artifact from annotations to append to the user message
function retrieveLatestArtifact(messages: Message[]): MessageContentDetail[] {
  const annotations = getAllAnnotations(messages);
  if (annotations.length === 0) return [];

  for (const { type, data } of annotations.reverse()) {
    if (
      type === "tools" &&
      "toolCall" in data &&
      "toolOutput" in data &&
      typeof data.toolCall === "object" &&
      typeof data.toolOutput === "object" &&
      data.toolCall !== null &&
      data.toolOutput !== null &&
      "name" in data.toolCall &&
      data.toolCall.name === "artifact"
    ) {
      const toolOutput = data.toolOutput as { output?: { code?: string } };
      if (toolOutput.output?.code) {
        return [
          {
            type: "text",
            text: `The existing code is:\n\`\`\`\n${toolOutput.output.code}\n\`\`\``,
          },
        ];
      }
    }
  }
  return [];
}

function convertAnnotations(messages: Message[]): MessageContentDetail[] {
  // get all annotations from user messages
  const annotations: Annotation[] = messages
    .filter((message) => message.role === "user" && message.annotations)
    .flatMap((message) => message.annotations?.map(getValidAnnotation) || []);
  if (annotations.length === 0) return [];

  const content: MessageContentDetail[] = [];
  annotations.forEach(({ type, data }) => {
    // convert image
    if (type === "image" && "url" in data && typeof data.url === "string") {
      content.push({
        type: "image_url",
        image_url: {
          url: data.url,
        },
      });
    }
    // convert the content of files to a text message
    if (
      type === "document_file" &&
      "files" in data &&
      Array.isArray(data.files)
    ) {
      const fileContent = data.files.map(getFileContent).join("\n");
      content.push({
        type: "text",
        text: fileContent,
      });
    }
  });

  return content;
}

function getValidAnnotation(annotation: JSONValue): Annotation {
  if (
    !(
      annotation &&
      typeof annotation === "object" &&
      "type" in annotation &&
      typeof annotation.type === "string" &&
      "data" in annotation &&
      annotation.data &&
      typeof annotation.data === "object"
    )
  ) {
    throw new Error("Client sent invalid annotation. Missing data and type");
  }
  return { type: annotation.type, data: annotation.data };
}

// validate and get all annotations of a specific type or role from the frontend messages
export function getAnnotations<
  T extends Annotation["data"] = Annotation["data"],
>(
  messages: Message[],
  options?: {
    role?: Message["role"]; // message role
    type?: Annotation["type"]; // annotation type
  },
): {
  type: string;
  data: T;
}[] {
  const messagesByRole = options?.role
    ? messages.filter((msg) => msg.role === options?.role)
    : messages;
  const annotations = getAllAnnotations(messagesByRole);
  const annotationsByType = options?.type
    ? annotations.filter((a) => a.type === options.type)
    : annotations;
  return annotationsByType as { type: string; data: T }[];
}
