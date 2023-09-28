import _ from "lodash";
import { LLMOptions, Portkey } from "portkey-ai";

export const readEnv = (env: string, default_val?: string): string | undefined => {
  if (typeof process !== 'undefined') {
      return process.env?.[env] ?? default_val;
  }
  return default_val;
};

interface PortkeyOptions {
  apiKey?: string;
  baseUrl?: string;
  mode?: string;
  llms?: [LLMOptions] | null
}

export class PortkeySession {
  portkey: Portkey;

  constructor(options:PortkeyOptions = {}) {
    if (!options.apiKey) {
      options.apiKey = readEnv('PORTKEY_API_KEY')
    }

    if (!options.baseUrl) {
      options.baseUrl = readEnv('PORTKEY_BASE_URL', "https://api.portkey.ai")
    }

    this.portkey = new Portkey({});
    this.portkey.llms = [{}]
    if (!options.apiKey) {
      throw new Error("Set Portkey ApiKey in PORTKEY_API_KEY env variable");
    }

    this.portkey = new Portkey(options);
  }
}

let defaultPortkeySession: {
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

