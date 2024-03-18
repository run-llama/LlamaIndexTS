import type { ChatMessage } from "../llm/types.js";

import mustache from "mustache";

import { mapTemplateVars, messagesToPrompt } from "./utils.js";

export interface BasePromptTemplate<T extends object = {}> {
  templateVars: Partial<T>;

  partialFormat: (vars: Partial<T>) => PromptTemplate | ChatPromptTemplate;

  format: (extraVars?: T) => string;
  formatMessages: (extraVars?: T) => ChatMessage[];
}

export class PromptTemplate<T extends object = {}>
  implements BasePromptTemplate<T>
{
  template: (...args: any) => string;

  templateVars: Partial<T> = {} as T;

  constructor(template: (...args: any) => string, templateVars?: T) {
    this.template = template;
    this.templateVars = templateVars ?? ({} as T);
  }

  mapTemplateVars(): Array<string> {
    return mapTemplateVars(this.template());
  }

  partialFormat(vars: Partial<T>): PromptTemplate {
    const templateVars = {
      ...vars,
    };

    this.templateVars = templateVars;

    return new PromptTemplate(this.template, templateVars);
  }

  format(extraVars?: Partial<T>): string {
    const prompt = mustache.render(this.template(), {
      ...this.templateVars,
      ...extraVars,
    });
    return prompt;
  }

  formatMessages(extraVars?: Partial<T>): ChatMessage[] {
    const prompt = this.format(extraVars);

    return [
      {
        content: prompt,
        role: "user",
      },
    ];
  }
}

export class ChatPromptTemplate<T extends object = {}>
  implements BasePromptTemplate<T>
{
  messageTemplates: (...args: any) => ChatMessage[];
  templateVars: Partial<T> = {} as T;

  constructor(
    messageTemplates: (...args: any) => ChatMessage[],
    templateVars?: T,
  ) {
    this.messageTemplates = messageTemplates;
    this.templateVars = templateVars ?? ({} as T);
  }

  mapTemplateVars(): Array<string> {
    const allVars: Array<string> = [];

    const messages = this.messageTemplates();

    for (const message of messages) {
      allVars.push(...mapTemplateVars(message.content));
    }

    return allVars;
  }

  partialFormat(vars: Partial<T>): ChatPromptTemplate {
    const templateVars = {
      ...vars,
    };

    this.templateVars = templateVars;

    return new ChatPromptTemplate(this.messageTemplates, templateVars);
  }

  format(extraVars?: T): string {
    const messages = this.formatMessages(extraVars);
    return messagesToPrompt(messages);
  }

  formatMessages(extraVars?: Partial<T>): ChatMessage[] {
    const messages: ChatMessage[] = [];

    for (const message of this.messageTemplates()) {
      const formattedMessage = mustache.render(message.content, {
        ...this.templateVars,
        ...extraVars,
      });

      messages.push({
        content: formattedMessage,
        role: message.role,
      });
    }

    return messages;
  }
}
