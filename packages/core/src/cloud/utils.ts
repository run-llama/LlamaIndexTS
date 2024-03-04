import type { PlatformApiClient } from "@llamaindex/cloud";
import { getEnv } from "@llamaindex/env";
import type { ClientParams } from "./types.js";
import { DEFAULT_BASE_URL } from "./types.js";

function getBaseUrl(baseUrl?: string): string {
  return baseUrl ?? getEnv("LLAMA_CLOUD_BASE_URL") ?? DEFAULT_BASE_URL;
}

export function getAppBaseUrl(baseUrl?: string): string {
  return getBaseUrl(baseUrl).replace(/api\./, "");
}

export async function getClient({
  apiKey,
  baseUrl,
}: ClientParams = {}): Promise<PlatformApiClient> {
  // Get the environment variables or use defaults
  baseUrl = getBaseUrl(baseUrl);
  apiKey = apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");

  const { PlatformApiClient } = await import("@llamaindex/cloud");

  return new PlatformApiClient({
    token: apiKey,
    environment: baseUrl,
  });
}
