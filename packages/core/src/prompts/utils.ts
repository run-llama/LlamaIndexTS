import type { ChatMessage } from "../index.js";

export const messagesToPrompt = (messages: ChatMessage[]): string => {
  const stringMessages = [];
  for (const message of messages) {
    const role = message.role;
    const content = message.content;
    let stringMessage = `${role}: ${content}`;

    const additionalKwargs = message.additionalKwargs;
    if (additionalKwargs) {
      stringMessage += `\n${additionalKwargs}`;
    }
    stringMessages.push(stringMessage);
  }

  stringMessages.push(`assistant: `);
  return stringMessages.join("\n");
};
