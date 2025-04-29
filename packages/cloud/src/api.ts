import { getEnv } from "@llamaindex/env";
import { client } from "./client";

export * from "./client";

export type ClientOptions = {
  baseUrl?: string;
  apiKey?: string;
};

export function initClient(options: ClientOptions) {
  const baseUrl = options.baseUrl ?? "https://api.cloud.llamaindex.ai";
  const apiKey = options.apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
  if (!apiKey) {
    throw new Error("Cannot find LlamaCloud API key");
  }
  client.setConfig({
    baseUrl,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
