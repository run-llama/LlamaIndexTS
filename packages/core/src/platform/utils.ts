import { PlatformApiClient } from "./client";

const DEFAULT_BASE_URL = "https://api.staging.llamaindex.ai";

export function getClient({
  apiKey,
  baseUrl,
}: { apiKey?: string; baseUrl?: string } = {}): PlatformApiClient {
  // Get the environment variables or use defaults
  baseUrl = baseUrl ?? process.env.LLAMA_CLOUD_BASE_URL ?? DEFAULT_BASE_URL;
  apiKey = apiKey ?? process.env.LLAMA_CLOUD_API_KEY;

  return new PlatformApiClient({
    token: apiKey,
    environment: baseUrl,
  });
}
