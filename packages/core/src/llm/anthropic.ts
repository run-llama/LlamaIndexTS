import type { ClientOptions } from "@anthropic-ai/sdk";
import Anthropic, { AI_PROMPT, HUMAN_PROMPT } from "@anthropic-ai/sdk";
import _ from "lodash";

export class AnthropicSession {
  anthropic: Anthropic;

  constructor(options: ClientOptions = {}) {
    if (!options.apiKey) {
      if (typeof process !== undefined) {
        options.apiKey = process.env.ANTHROPIC_API_KEY;
      }
    }

    if (!options.apiKey) {
      throw new Error("Set Anthropic Key in ANTHROPIC_API_KEY env variable"); // Overriding Anthropic package's error message
    }

    this.anthropic = new Anthropic(options);
  }
}

// I'm not 100% sure this is necessary vs. just starting a new session
// every time we make a call. They say they try to reuse connections
// so in theory this is more efficient, but we should test it in the future.
const defaultAnthropicSession: {
  session: AnthropicSession;
  options: ClientOptions;
}[] = [];

/**
 * Get a session for the Anthropic API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
export function getAnthropicSession(options: ClientOptions = {}) {
  let session = defaultAnthropicSession.find((session) => {
    return _.isEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new AnthropicSession(options);
    defaultAnthropicSession.push({ session, options });
  }

  return session;
}

export const ANTHROPIC_HUMAN_PROMPT = HUMAN_PROMPT;
export const ANTHROPIC_AI_PROMPT = AI_PROMPT;
