import { LlamaCloudApiClient } from "@llamaindex/cloud";
import { getEnv } from "@llamaindex/env";
import type { ClientParams } from "./types.js";
import { DEFAULT_BASE_URL } from "./types.js";

export function camelToSnake(name: string): string {
  // Replace all lowercase-uppercase letter pairs with lowercase letter followed by an underscore and the uppercase letter, then convert to lowercase
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

export function paramsToSnakeCase<T>(
  params: Record<string, T>,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [camelToSnake(key), value]),
  );
}

function getBaseUrl(baseUrl?: string): string {
  return baseUrl ?? getEnv("LLAMA_CLOUD_BASE_URL") ?? DEFAULT_BASE_URL;
}

export function getAppBaseUrl(baseUrl?: string): string {
  return getBaseUrl(baseUrl).replace(/api\./, "");
}

export function getClient({
  apiKey,
  baseUrl,
}: ClientParams = {}): LlamaCloudApiClient {
  // Get the environment variables or use defaults
  baseUrl = getBaseUrl(baseUrl);
  apiKey = apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");

  if (!apiKey) {
    throw new Error(
      "API Key is required for LlamaCloudIndex. Please pass the apiKey parameter",
    );
  }

  const client = new LlamaCloudApiClient({
    token: apiKey,
    environment: baseUrl,
  });

  return client;
}
