import { PlatformApiClient } from "./client";
import { ClientParams, DEFAULT_BASE_URL } from "./types";

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
