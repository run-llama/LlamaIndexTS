import { PlatformApiClient } from "./client";

export const DEFAULT_PROJECT_NAME = "default";
const DEFAULT_BASE_URL = "https://api.cloud.llamaindex.ai";

export type ClientParams = { apiKey?: string; baseUrl?: string };

export function getClient({
  apiKey,
  baseUrl,
}: ClientParams = {}): PlatformApiClient {
  // Get the environment variables or use defaults
  baseUrl = baseUrl ?? process.env.LLAMA_CLOUD_BASE_URL ?? DEFAULT_BASE_URL;
  apiKey = apiKey ?? process.env.LLAMA_CLOUD_API_KEY;

  return new PlatformApiClient({
    token: apiKey,
    environment: baseUrl,
  });
}
