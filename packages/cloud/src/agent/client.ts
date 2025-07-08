import { getEnv } from "@llamaindex/env";
import pRetry from "p-retry";
import { client } from "../client/client.gen";
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
export class AsyncAgentDataClient {
  private apiKey: string | undefined;
  private baseUrl: string | undefined;

  constructor(options?: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = options?.apiKey || getEnv("LLAMA_CLOUD_API_KEY");
    this.baseUrl = options?.baseUrl;

    if (this.baseUrl) {
      client.setConfig({
        baseUrl: this.baseUrl,
        headers: {
          "X-SDK-Name": "llamaindex-ts",
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
      });
    } else if (this.apiKey) {
      client.setConfig({
        headers: {
          "X-SDK-Name": "llamaindex-ts",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
    }
  }

  /**
   * Create new agent data
   */
  async create<T = unknown>(
    options: CreateAgentDataOptions<T>,
  ): Promise<TypedAgentData<T>> {
    const response = await client.post({
      url: "/api/agent-data",
      body: {
        name: options.name,
        description: options.description,
        schema: options.schema,
        data: options.data as Record<string, unknown>,
        metadata: options.metadata,
      },
    });

    if (response.error) {
      throw new Error(
        `Failed to create agent data: ${response.error || "Unknown error"}`,
      );
    }

    return this.transformResponse(response.data as Record<string, unknown>);
  }

  /**
   * Get agent data by ID
   */
  async get<T = unknown>(id: string): Promise<TypedAgentData<T> | null> {
    const response = await client.get("/api/agent-data/{id}", {
      params: { path: { id } },
    });

    if (response.error) {
      if (response.response?.status === 404) {
        return null;
      }
      throw new Error(
        `Failed to get agent data: ${response.error.message || "Unknown error"}`,
      );
    }

    return this.transformResponse(response.data);
  }

  /**
   * Update agent data
   */
  async update<T = unknown>(
    id: string,
    options: UpdateAgentDataOptions<T>,
  ): Promise<TypedAgentData<T>> {
    const response = await client.patch({
      url: "/api/agent-data/{id}",
      params: { path: { id } },
      body: {
        name: options.name,
        description: options.description,
        schema: options.schema,
        data: options.data as Record<string, unknown>,
        metadata: options.metadata,
      },
    });

    if (response.error) {
      throw new Error(
        `Failed to update agent data: ${response.error.message || "Unknown error"}`,
      );
    }

    return this.transformResponse(response.data);
  }

  /**
   * Delete agent data
   */
  async delete(id: string): Promise<void> {
    const response = await client.DELETE("/api/agent-data/{id}", {
      params: { path: { id } },
    });

    if (response.error) {
      throw new Error(
        `Failed to delete agent data: ${response.error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * List agent data
   */
  async list<T = unknown>(
    options?: ListAgentDataOptions,
  ): Promise<TypedAgentDataItems<T>> {
    const response = await client.GET("/api/agent-data", {
      params: {
        query: {
          page: options?.page || 1,
          pageSize: options?.pageSize || 20,
          filter: options?.filter ? JSON.stringify(options.filter) : undefined,
          sort: options?.sort ? JSON.stringify(options.sort) : undefined,
        },
      },
    });

    if (response.error) {
      throw new Error(
        `Failed to list agent data: ${response.error.message || "Unknown error"}`,
      );
    }

    return {
      items: response.data.items.map((item: unknown) =>
        this.transformResponse(item),
      ),
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.pageSize,
    };
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
      const response = await client.POST("/api/agent-data/{id}/extract", {
        params: { path: { id: agentId } },
        body: { input },
      });

      if (response.error) {
        throw new Error(
          `Failed to extract data: ${response.error.message || "Unknown error"}`,
        );
      }

      const extractedData = response.data as ExtractedData<T>;

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

      const response = await client.get({
        url: `/api/extractions/${extractionId}`,
      });

      if (response.error) {
        throw new Error(
          `Failed to get extraction status: ${response.error.message || "Unknown error"}`,
        );
      }

      const extractedData = response.data as ExtractedData<T>;

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
  private transformResponse<T = unknown>(
    data: Record<string, unknown>,
  ): TypedAgentData<T> {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string | undefined,
      schema: data.schema as Record<string, unknown> | undefined,
      data: data.data as T,
      metadata: data.metadata as Record<string, unknown> | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}

/**
 * Create a new AsyncAgentDataClient instance
 */
export function createAgentDataClient(options?: {
  apiKey?: string;
  baseUrl?: string;
}): AsyncAgentDataClient {
  return new AsyncAgentDataClient(options);
}
