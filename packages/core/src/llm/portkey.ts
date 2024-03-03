import { getEnv } from "@llamaindex/env";
import _ from "lodash";
import type { LLMOptions } from "portkey-ai";
import { Portkey } from "portkey-ai";

interface PortkeyOptions {
  apiKey?: string;
  baseURL?: string;
  mode?: string;
  llms?: [LLMOptions] | null;
}

export class PortkeySession {
  portkey: Portkey;

  constructor(options: PortkeyOptions = {}) {
    if (!options.apiKey) {
      options.apiKey = getEnv("PORTKEY_API_KEY");
    }

    if (!options.baseURL) {
      options.baseURL = getEnv("PORTKEY_BASE_URL") ?? "https://api.portkey.ai";
    }

    this.portkey = new Portkey({});
    this.portkey.llms = [{}];
    if (!options.apiKey) {
      throw new Error("Set Portkey ApiKey in PORTKEY_API_KEY env variable");
    }

    this.portkey = new Portkey(options);
  }
}

const defaultPortkeySession: {
  session: PortkeySession;
  options: PortkeyOptions;
}[] = [];

/**
 * Get a session for the Portkey API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
export function getPortkeySession(options: PortkeyOptions = {}) {
  let session = defaultPortkeySession.find((session) => {
    return _.isEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new PortkeySession(options);
    defaultPortkeySession.push({ session, options });
  }
  return session;
}
