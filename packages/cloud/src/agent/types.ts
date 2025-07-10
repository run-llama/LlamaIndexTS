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
 * Filter operation for searching/filtering agent data
 */
export interface FilterOperation {
  [key: string]: unknown;
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
  agentSlug: string;
  collection?: string;
  data: T;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Collection of typed agent data items
 */
export interface TypedAgentDataItems<T = unknown> {
  items: TypedAgentData<T>[];
  totalSize?: number;
  nextPageToken?: string;
}

/**
 * Options for creating agent data
 */
export interface CreateAgentDataOptions<T = unknown> {
  agentSlug: string;
  collection?: string;
  data: T;
}

/**
 * Options for updating agent data
 */
export interface UpdateAgentDataOptions<T = unknown> {
  data: T;
}

/**
 * Sort options for listing
 */
export interface SortOptions {
  field: string;
  order: "asc" | "desc";
}

/**
 * Options for listing agent data
 */
export interface ListAgentDataOptions {
  agentSlug: string;
  collection?: string;
  filter?: Record<string, FilterOperation>;
  orderBy?: string;
  pageSize?: number;
  pageToken?: string;
  offset?: number;
}

/**
 * Options for extraction
 */
export interface ExtractOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

export type ExtractedT<T> = T;
export type AgentDataT<T> = T;
