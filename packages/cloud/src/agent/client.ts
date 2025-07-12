import { createClient, createConfig } from "@hey-api/client-fetch";
import { getEnv } from "@llamaindex/env";
import {
  createAgentDataApiV1BetaAgentDataPost,
  deleteAgentDataApiV1BetaAgentDataItemIdDelete,
  getAgentDataApiV1BetaAgentDataItemIdGet,
  searchAgentDataApiV1BetaAgentDataSearchPost,
  updateAgentDataApiV1BetaAgentDataItemIdPut,
  type AgentData,
  type AgentDataCreate,
  type AgentDataUpdate,
  type PaginatedResponseAgentData,
  type SearchRequest,
} from "../client";

/**
 * Async client for agent data operations
 */
export class AgentClient {
  private client: ReturnType<typeof createClient>;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options?: { apiKey?: string; baseUrl?: string }) {
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
  async create(options: AgentDataCreate): Promise<AgentData> {
    const response = await createAgentDataApiV1BetaAgentDataPost({
      throwOnError: true,
      body: {
        ...options,
      },
      client: this.client,
    });

    return response.data;
  }

  /**
   * Get agent data by ID
   */
  async get(id: string): Promise<AgentData | null> {
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
  async update(id: string, options: AgentDataUpdate): Promise<AgentData> {
    const response = await updateAgentDataApiV1BetaAgentDataItemIdPut({
      throwOnError: true,
      path: { item_id: id },
      body: {
        data: options.data as Record<string, unknown>,
      },
      client: this.client,
    });

    return response.data;
  }

  /**
   * Delete agent data
   */
  async delete(id: string): Promise<void> {
    await deleteAgentDataApiV1BetaAgentDataItemIdDelete({
      throwOnError: true,
      path: { item_id: id },
      client: this.client,
    });
  }

  /**
   * List agent data
   */
  async list(options: SearchRequest): Promise<PaginatedResponseAgentData> {
    const response = await searchAgentDataApiV1BetaAgentDataSearchPost({
      throwOnError: true,
      body: {
        ...options,
      },
      client: this.client,
    });

    return response.data;
  }
}

export function createAgentClient(options?: {
  apiKey?: string;
  baseUrl?: string;
}): AgentClient {
  return new AgentClient(options);
}
