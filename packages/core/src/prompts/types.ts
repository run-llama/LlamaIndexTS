import type { ChatMessage } from "../llm/types.js";

import mustache from "mustache";
import { messagesToPrompt } from "./utils.js";

export interface BasePromptTemplate {  
  templateVars: Record<string, any>;

  partialFormat?: (vars: Record<string, any>) => PromptTemplate;
  format: (metadata: Record<string, any>) => string;
  formatMessages: (metadata: Record<string, any>) => ChatMessage[];
}

export class PromptTemplate implements BasePromptTemplate {
  templateVars: Record<string, any>;
  template: (...args: any) => string;

  constructor(
    template: (...args: any) => string,
    templateVars: Record<string, any>,
  ) {
    this.template = template;
    this.templateVars = templateVars;
  }

  partialFormat(vars: Record<string, any>): PromptTemplate {
    const templateVars = {
      ...vars
    };

    const prompt = mustache.render(this.template(), templateVars);

    return new PromptTemplate(() => prompt, templateVars);
  }

  format(metadata: Record<string, any>): string {
    const prompt = mustache.render(this.template(), metadata);
    return prompt;
  }

  formatMessages(metadata: Record<string, any>): ChatMessage[] {
    const prompt = this.format(metadata);

    return [
      {
        content: prompt,
        role: "user"
      }
    ]
  }
}

export class ChatPromptTemplate implements BasePromptTemplate {
  templateVars: Record<string, any>;
  messageTemplates: (...args: any) => ChatMessage[];

  constructor(
    messageTemplates: (...args: any) => ChatMessage[],
    templateVars: Record<string, any>,
  ) {
    this.messageTemplates = messageTemplates;
    this.templateVars = templateVars;
  }

  format(metadata: Record<string, any>): string {
     const messages = this.formatMessages(metadata);
     return messagesToPrompt(messages);
  }

  formatMessages(metadata: Record<string, any>): ChatMessage[] {
    const messages: ChatMessage[] = [];

    for (const message of this.messageTemplates()) {
      const formattedMessage = mustache.render(message.content, metadata);

      messages.push({
        content: formattedMessage,
        role: message.role
      });
    }

    return messages;
  }
}