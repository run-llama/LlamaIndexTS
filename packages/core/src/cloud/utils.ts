import { PlatformApiClient } from "@llamaindex/cloud";
import { ClientParams, DEFAULT_BASE_URL } from "./types.js";

export async function getClient({
  apiKey,
  baseUrl,
}: ClientParams = {}): Promise<PlatformApiClient> {
  // Get the environment variables or use defaults
  baseUrl = baseUrl ?? process.env.LLAMA_CLOUD_BASE_URL ?? DEFAULT_BASE_URL;
  apiKey = apiKey ?? process.env.LLAMA_CLOUD_API_KEY;

  const { PlatformApiClient } = await import("@llamaindex/cloud");

  return new PlatformApiClient({
    token: apiKey,
    environment: baseUrl,
  });
}
