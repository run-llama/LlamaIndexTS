import { createClient, createConfig } from "@hey-api/client-fetch";
import { getEnv } from "@llamaindex/env";
import pRetry from "p-retry";
import {
  createAgentDataApiV1BetaAgentDataPost,
  deleteAgentDataApiV1BetaAgentDataItemIdDelete,
  getAgentDataApiV1BetaAgentDataItemIdGet,
  searchAgentDataApiV1BetaAgentDataSearchPost,
  updateAgentDataApiV1BetaAgentDataItemIdPut,
  type AgentData,
} from "../client";
import type {
  CreateAgentDataOptions,
  ExtractedData,
  ExtractOptions,
  ListAgentDataOptions,
  TypedAgentData,
  TypedAgentDataItems,
  UpdateAgentDataOptions,
} from "./types";

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
  async create<T = unknown>(
    options: CreateAgentDataOptions<T>,
  ): Promise<TypedAgentData<T>> {
    const response = await createAgentDataApiV1BetaAgentDataPost({
      throwOnError: true,
      body: {
        agent_slug: options.agentSlug,
        ...(options.collection !== undefined && {
          collection: options.collection,
        }),
        data: options.data as Record<string, unknown>,
      },
      client: this.client,
    });

    return this.transformResponse(response.data);
  }

  /**
   * Get agent data by ID
   */
  async get<T = unknown>(id: string): Promise<TypedAgentData<T> | null> {
    try {
      const response = await getAgentDataApiV1BetaAgentDataItemIdGet({
        throwOnError: true,
        path: { item_id: id },
        client: this.client,
      });

      return this.transformResponse(response.data);
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
  async update<T = unknown>(
    id: string,
    options: UpdateAgentDataOptions<T>,
  ): Promise<TypedAgentData<T>> {
    const response = await updateAgentDataApiV1BetaAgentDataItemIdPut({
      throwOnError: true,
      path: { item_id: id },
      body: {
        data: options.data as Record<string, unknown>,
      },
      client: this.client,
    });

    return this.transformResponse(response.data);
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
  async list<T = unknown>(
    options: ListAgentDataOptions,
  ): Promise<TypedAgentDataItems<T>> {
    const response = await searchAgentDataApiV1BetaAgentDataSearchPost({
      throwOnError: true,
      body: {
        agent_slug: options.agentSlug,
        ...(options.collection !== undefined && {
          collection: options.collection,
        }),
        ...(options.filter !== undefined && { filter: options.filter }),
        ...(options.orderBy !== undefined && { order_by: options.orderBy }),
        ...(options.pageSize !== undefined && { page_size: options.pageSize }),
        ...(options.pageToken !== undefined && {
          page_token: options.pageToken,
        }),
        ...(options.offset !== undefined && { offset: options.offset }),
      },
      client: this.client,
    });

    const result: TypedAgentDataItems<T> = {
      items: response.data.items.map((item: AgentData) =>
        this.transformResponse(item),
      ),
    };

    if (
      response.data.total_size !== null &&
      response.data.total_size !== undefined
    ) {
      result.totalSize = response.data.total_size;
    }

    if (
      response.data.next_page_token !== null &&
      response.data.next_page_token !== undefined
    ) {
      result.nextPageToken = response.data.next_page_token;
    }

    return result;
  }

  /**
   * Extract data from agent with retry logic
   */
  async extract<T = unknown>(
    agentId: string,
    input: unknown,
    options?: ExtractOptions,
  ): Promise<ExtractedData<T>> {
    const extractOptions = {
      retries: options?.retryCount || 3,
      onFailedAttempt: (error: {
        attemptNumber: number;
        retriesLeft: number;
      }) => {
        console.log(
          `Extraction attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
        );
      },
      minTimeout: options?.retryDelay || 1000,
      maxTimeout: options?.timeout || 30000,
    };

    return pRetry(async () => {
      // Note: The extract endpoint might not be in the generated client yet
      // Using the native fetch API for this endpoint
      const response = await fetch(
        `${this.baseUrl}/api/v1/beta/agent-data/${agentId}/extract`,
        {
          method: "POST",
          body: JSON.stringify({ input }),
          headers: {
            "Content-Type": "application/json",
            ...this.headers,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to extract data: ${response.statusText}`);
      }

      const extractedData = (await response.json()) as ExtractedData<T>;

      // If status is still pending or in progress, poll for completion
      if (
        extractedData.status === "pending" ||
        extractedData.status === "in_progress"
      ) {
        return this.pollExtraction<T>(extractedData.id, options);
      }

      return extractedData;
    }, extractOptions);
  }

  /**
   * Poll for extraction completion
   */
  private async pollExtraction<T = unknown>(
    extractionId: string,
    options?: ExtractOptions,
  ): Promise<ExtractedData<T>> {
    const pollInterval = 2000; // 2 seconds
    const maxAttempts = Math.floor((options?.timeout || 30000) / pollInterval);

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      const response = await fetch(
        `${this.baseUrl}/api/v1/extractions/${extractionId}`,
        {
          headers: this.headers,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get extraction status: ${response.statusText}`,
        );
      }

      const extractedData = (await response.json()) as ExtractedData<T>;

      if (
        extractedData.status === "completed" ||
        extractedData.status === "failed"
      ) {
        return extractedData;
      }
    }

    throw new Error("Extraction timeout exceeded");
  }

  /**
   * Transform API response to typed data
   */
  private transformResponse<T = unknown>(data: AgentData): TypedAgentData<T> {
    const result: TypedAgentData<T> = {
      id: data.id!,
      agentSlug: data.agent_slug,
      data: data.data as T,
      createdAt: new Date(data.created_at!),
      updatedAt: new Date(data.updated_at!),
    };

    if (data.collection !== undefined) {
      result.collection = data.collection;
    }

    return result;
  }
}

/**
 * Create a new AsyncAgentDataClient instance
 */
export function createAgentDataClient(options?: {
  apiKey?: string;
  baseUrl?: string;
}): AgentClient {
  return new AgentClient(options);
}
