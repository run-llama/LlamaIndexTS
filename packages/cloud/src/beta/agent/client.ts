import { createClient, createConfig } from "@hey-api/client-fetch";
import { getEnv } from "@llamaindex/env";
import {
  aggregateAgentDataApiV1BetaAgentDataAggregatePost,
  createAgentDataApiV1BetaAgentDataPost,
  deleteAgentDataApiV1BetaAgentDataItemIdDelete,
  getAgentDataApiV1BetaAgentDataItemIdGet,
  searchAgentDataApiV1BetaAgentDataSearchPost,
  updateAgentDataApiV1BetaAgentDataItemIdPut,
  type AggregateRequest as OriginalAggregateRequest,
  type SearchRequest as OriginalSearchRequest,
} from "../../client";
import type {
  AgentData,
  AggregateRequest,
  PaginatedResponseAgentData,
  PaginatedResponseAggregateGroup,
  SearchRequest,
} from "./types";

// Utility functions to convert between camelCase and snake_case
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeysToSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  } else if (
    obj !== null &&
    typeof obj === "object" &&
    obj.constructor === Object
  ) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = convertKeysToSnakeCase(value);
    }
    return result;
  }
  return obj;
}

function convertKeysToCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item)) as T;
  } else if (
    obj !== null &&
    typeof obj === "object" &&
    obj.constructor === Object
  ) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = convertKeysToCamelCase(value);
    }
    return result as T;
  }
  return obj as T;
}

type AgentClientOptions = {
  apiKey?: string;
  baseUrl?: string;
  collection?: string;
  agentUrlId?: string;
  windowUrl?: string;
};

/**
 * Async client for agent data operations
 */
export class AgentClient<T = unknown> {
  private client: ReturnType<typeof createClient>;
  private baseUrl: string;
  private headers: Record<string, string>;
  private collection: string;
  private agentUrlId: string;

  constructor(options: AgentClientOptions = {}) {
    // Handle windowUrl to infer agentUrlId
    let inferredAgentUrlId: string | undefined;
    if (options.windowUrl && !options.agentUrlId) {
      try {
        const path = new URL(options.windowUrl).pathname;
        // /deployments/<agent-url-id>/ui/ -> ["", "deployments", "<agent-url-id>", "ui"]
        inferredAgentUrlId = path.split("/")[2];
      } catch (error) {
        console.warn(
          "Failed to infer agent url id from window url, falling back to default",
          error,
        );
      }
    }

    this.collection = options.collection || "default";
    this.agentUrlId = options.agentUrlId || inferredAgentUrlId || "default";
    const apiKey = options?.apiKey || getEnv("LLAMA_CLOUD_API_KEY");
    this.baseUrl = options?.baseUrl || "https://api.cloud.llamaindex.ai/";

    this.headers = {
      "X-SDK-Name": "llamaindex-ts",
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    };

    this.client = createClient(
      createConfig({
        baseUrl: this.baseUrl,
        headers: this.headers,
      }),
    );
  }

  /**
   * Create new agent data
   */
  async createItem(data: T): Promise<AgentData> {
    const response = await createAgentDataApiV1BetaAgentDataPost({
      throwOnError: true,
      body: {
        collection: this.collection,
        agent_slug: this.agentUrlId,
        data: convertKeysToSnakeCase(data) as Record<string, unknown>,
      },
      client: this.client,
    });

    return convertKeysToCamelCase<AgentData>(response.data);
  }

  /**
   * Get agent data by ID
   */
  async getItem(id: string): Promise<AgentData | null> {
    try {
      const response = await getAgentDataApiV1BetaAgentDataItemIdGet({
        throwOnError: true,
        path: { item_id: id },
        client: this.client,
      });

      return convertKeysToCamelCase<AgentData>(response.data);
    } catch (error) {
      if (
        error instanceof Error &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update agent data
   */
  async updateItem(id: string, data: T): Promise<AgentData> {
    const response = await updateAgentDataApiV1BetaAgentDataItemIdPut({
      throwOnError: true,
      path: { item_id: id },
      body: {
        data: convertKeysToSnakeCase(data) as Record<string, unknown>,
      },
      client: this.client,
    });

    return convertKeysToCamelCase<AgentData>(response.data);
  }

  /**
   * Delete agent data
   */
  async deleteItem(id: string): Promise<void> {
    await deleteAgentDataApiV1BetaAgentDataItemIdDelete({
      throwOnError: true,
      path: { item_id: id },
      client: this.client,
    });
  }

  /**
   * Search agent data
   */
  async search(
    options: Partial<SearchRequest> = {},
  ): Promise<PaginatedResponseAgentData> {
    const snakeCaseOptions = convertKeysToSnakeCase(
      options,
    ) as Partial<OriginalSearchRequest>;
    const response = await searchAgentDataApiV1BetaAgentDataSearchPost({
      throwOnError: true,
      body: {
        ...snakeCaseOptions,
        agent_slug: this.agentUrlId,
        collection: this.collection,
      },
      client: this.client,
    });

    return convertKeysToCamelCase<PaginatedResponseAgentData>(response.data);
  }

  /**
   * Aggregate agent data into groups
   */
  async aggregate(
    options: Partial<AggregateRequest> = {},
  ): Promise<PaginatedResponseAggregateGroup> {
    const snakeCaseOptions = convertKeysToSnakeCase(
      options,
    ) as Partial<OriginalAggregateRequest>;
    const response = await aggregateAgentDataApiV1BetaAgentDataAggregatePost({
      throwOnError: true,
      body: {
        ...snakeCaseOptions,
        agent_slug: this.agentUrlId,
        collection: this.collection,
      },
      client: this.client,
    });

    return convertKeysToCamelCase<PaginatedResponseAggregateGroup>(
      response.data,
    );
  }
}

export function createAgentDataClient<T = unknown>(
  options: AgentClientOptions = {},
): AgentClient<T> {
  return new AgentClient<T>(options);
}
