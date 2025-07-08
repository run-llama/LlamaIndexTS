/**
 * Status types for agent data processing
 */
export enum StatusType {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Base extracted data interface
 */
export interface ExtractedData<T = unknown> {
  id: string;
  status: StatusType;
  data?: T;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TypedAgentData interface for typed agent data
 */
export interface TypedAgentData<T = unknown> {
  id: string;
  name: string;
  description?: string;
  schema: Record<string, unknown> | undefined;
  data: T;
  metadata: Record<string, unknown> | undefined;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Collection of typed agent data items
 */
export interface TypedAgentDataItems<T = unknown> {
  items: TypedAgentData<T>[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Options for creating agent data
 */
export interface CreateAgentDataOptions<T = unknown> {
  name: string;
  description?: string;
  schema?: Record<string, unknown>;
  data: T;
  metadata?: Record<string, unknown>;
}

/**
 * Options for updating agent data
 */
export interface UpdateAgentDataOptions<T = unknown> {
  name?: string;
  description?: string;
  schema?: Record<string, unknown>;
  data?: T;
  metadata?: Record<string, unknown>;
}

/**
 * Query options for listing agent data
 */
export interface ListAgentDataOptions {
  page?: number;
  pageSize?: number;
  filter?: Record<string, unknown>;
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
}

/**
 * Extraction options
 */
export interface ExtractOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Generic type helpers
 */
export type ExtractedT<T> = ExtractedData<T>;
export type AgentDataT<T> = TypedAgentData<T>;
