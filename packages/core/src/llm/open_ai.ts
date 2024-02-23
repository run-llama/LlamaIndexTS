import _ from "lodash";
import OpenAI, { ClientOptions } from "openai";

export class AzureOpenAI extends OpenAI {
  protected override authHeaders() {
    return { "api-key": this.apiKey };
  }
}

export class OpenAISession {
  openai: OpenAI;

  constructor(options: ClientOptions & { azure?: boolean } = {}) {
    if (!options.apiKey) {
      if (typeof process !== undefined) {
        options.apiKey = process.env.OPENAI_API_KEY;
      }
    }

    if (!options.apiKey) {
      throw new Error("Set OpenAI Key in OPENAI_API_KEY env variable"); // Overriding OpenAI package's error message
    }

    if (options.azure) {
      this.openai = new AzureOpenAI(options);
    } else {
      this.openai = new OpenAI({
        ...options,
        // defaultHeaders: { "OpenAI-Beta": "assistants=v1" },
      });
    }
  }
}

// I'm not 100% sure this is necessary vs. just starting a new session
// every time we make a call. They say they try to reuse connections
// so in theory this is more efficient, but we should test it in the future.
const defaultOpenAISession: {
  session: OpenAISession;
  options: ClientOptions;
}[] = [];

/**
 * Get a session for the OpenAI API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
export function getOpenAISession(
  options: ClientOptions & { azure?: boolean } = {},
) {
  let session = defaultOpenAISession.find((session) => {
    return _.isEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new OpenAISession(options);
    defaultOpenAISession.push({ session, options });
  }

  return session;
}
