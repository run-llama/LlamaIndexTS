import { client } from "./client";

export * from "./client";

export type ClientOptions = {
  baseUrl?: string;
  apiKey: string;
};

export function initClient(options: ClientOptions) {
  const baseUrl = options.baseUrl ?? "https://api.cloud.llamaindex.ai";
  client.setConfig({
    baseUrl,
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
    },
  });
}
