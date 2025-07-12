import { createClient, createConfig } from "@hey-api/client-fetch";
import { getEnv } from "@llamaindex/env";
import {
  aggregateAgentDataApiV1BetaAgentDataAggregatePost,
  createAgentDataApiV1BetaAgentDataPost,
  deleteAgentDataApiV1BetaAgentDataItemIdDelete,
  getAgentDataApiV1BetaAgentDataItemIdGet,
  searchAgentDataApiV1BetaAgentDataSearchPost,
  updateAgentDataApiV1BetaAgentDataItemIdPut,
  type AgentData,
  type AggregateRequest,
  type PaginatedResponseAgentData,
  type PaginatedResponseAggregateGroup,
  type SearchRequest,
} from "../../client";

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
        data: data as Record<string, unknown>,
      },
      client: this.client,
    });

    return response.data;
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

      return response.data;
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
        data: data as Record<string, unknown>,
      },
      client: this.client,
    });

    return response.data;
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
    const response = await searchAgentDataApiV1BetaAgentDataSearchPost({
      throwOnError: true,
      body: {
        ...options,
        agent_slug: this.agentUrlId,
        collection: this.collection,
      },
      client: this.client,
    });

    return response.data;
  }

  /**
   * Aggregate agent data into groups
   */
  async aggregate(
    options: Partial<AggregateRequest> = {},
  ): Promise<PaginatedResponseAggregateGroup> {
    const response = await aggregateAgentDataApiV1BetaAgentDataAggregatePost({
      throwOnError: true,
      body: {
        ...options,
        agent_slug: this.agentUrlId,
        collection: this.collection,
      },
      client: this.client,
    });

    return response.data;
  }
}

export function createAgentDataClient<T = unknown>(
  options: AgentClientOptions = {},
): AgentClient<T> {
  return new AgentClient<T>(options);
}
