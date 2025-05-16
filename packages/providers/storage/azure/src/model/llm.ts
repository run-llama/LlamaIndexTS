import { OpenAI } from "@llamaindex/openai";
import { lazySession, type AzureInitSession } from "./azure";

export class AzureOpenAI extends OpenAI {
  constructor(init?: Omit<Partial<OpenAI>, "session"> & AzureInitSession) {
    super({
      ...init,
      session: undefined,
    });
    this.lazySession = lazySession(init);
  }
}
