import OpenAI, { ClientOptions } from "openai";

export class OpenAISession {
  openAIKey: string | null = null;
  openai: OpenAI;

  constructor(openAIKey: string | null = null) {
    if (openAIKey) {
      this.openAIKey = openAIKey;
    } else if (process.env.OPENAI_API_KEY) {
      this.openAIKey = process.env.OPENAI_API_KEY;
    } else {
      throw new Error("Set OpenAI Key in OPENAI_API_KEY env variable");
    }

    const configuration: ClientOptions = {
      apiKey: this.openAIKey,
    };

    this.openai = new OpenAI(configuration);
  }
}

let defaultOpenAISession: OpenAISession | null = null;

export function getOpenAISession(openAIKey: string | null = null) {
  if (!defaultOpenAISession) {
    defaultOpenAISession = new OpenAISession(openAIKey);
  }

  return defaultOpenAISession;
}
