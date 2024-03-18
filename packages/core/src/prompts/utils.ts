import type { ChatMessage } from "../llm/types.js";

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

export const mapTemplateVars = (template: string): Array<string> => {
  const placeholders: Array<string> = [];
  let index = 0;

  while (index < template.length) {
    const startIndex = template.indexOf("{{", index);
    const endIndex = template.indexOf("}}", startIndex) + 2; // +2 to include the '}}'

    if (startIndex === -1 || endIndex === 1) {
      // No more placeholders
      break;
    }

    const placeholderName = template
      .substring(startIndex + 2, endIndex - 2)
      .trim(); // Extract name

    placeholders.push(placeholderName);

    index = endIndex; // Move index to end of current placeholder
  }

  return placeholders;
};
