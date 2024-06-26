import { OpenAPI, Service } from "@llamaindex/cloud/api";
import { getEnv } from "@llamaindex/env";
import type { ClientParams } from "./constants.js";
import { DEFAULT_BASE_URL } from "./constants.js";

function getBaseUrl(baseUrl?: string): string {
  return baseUrl ?? getEnv("LLAMA_CLOUD_BASE_URL") ?? DEFAULT_BASE_URL;
}

export function getAppBaseUrl(baseUrl?: string): string {
  return getBaseUrl(baseUrl).replace(/api\./, "");
}

export function initService({
  apiKey,
  baseUrl,
}: ClientParams = {}): typeof Service {
  OpenAPI.TOKEN = apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
  OpenAPI.BASE = getBaseUrl(baseUrl);
  if (!OpenAPI.TOKEN) {
    throw new Error(
      "API Key is required for LlamaCloudIndex. Please pass the apiKey parameter",
    );
  }

  return Service;
}
