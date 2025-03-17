import type { Message } from "ai";
import type { Response as ExpressResponse } from "express";

export async function pipeExpressResponse(
  expressResponse: ExpressResponse,
  streamResponse: Response,
) {
  if (!streamResponse.body) return;
  const reader = streamResponse.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) return expressResponse.end();
    expressResponse.write(value);
  }
}

export function getUserMessageContent(messages: Message[]): string {
  const userMessageContent = messages[messages.length - 1]?.content;
  if (!userMessageContent) {
    throw new Error(
      "Messages are required and the last message must be from the user",
    );
  }
  return userMessageContent;
}
