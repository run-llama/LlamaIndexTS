// Utility type to convert snake_case to camelCase
type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

// Utility type to recursively convert all keys in an object from snake_case to camelCase
type KeysToCamelCase<T> =
  T extends Array<infer U>
    ? Array<KeysToCamelCase<U>>
    : T extends object
      ? {
          [K in keyof T as SnakeToCamelCase<K & string>]: KeysToCamelCase<T[K]>;
        }
      : T;

// Import original types from client
import type {
  AgentData as OriginalAgentData,
  AggregateGroup as OriginalAggregateGroup,
  AggregateRequest as OriginalAggregateRequest,
  FilterOperation as OriginalFilterOperation,
  PaginatedResponseAgentData as OriginalPaginatedResponseAgentData,
  PaginatedResponseAggregateGroup as OriginalPaginatedResponseAggregateGroup,
  SearchRequest as OriginalSearchRequest,
} from "../../client";

// Re-export types with camelCase conversion
export type AgentData = KeysToCamelCase<OriginalAgentData>;
export type PaginatedResponseAgentData =
  KeysToCamelCase<OriginalPaginatedResponseAgentData>;
export type PaginatedResponseAggregateGroup =
  KeysToCamelCase<OriginalPaginatedResponseAggregateGroup>;
export type SearchRequest = KeysToCamelCase<OriginalSearchRequest>;
export type AggregateRequest = KeysToCamelCase<OriginalAggregateRequest>;
export type FilterOperation = KeysToCamelCase<OriginalFilterOperation>;
export type AggregateGroup = KeysToCamelCase<OriginalAggregateGroup>;

/**
 * Status types for agent data processing
 */
export const StatusType = {
  ERROR: "error",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  PENDING_REVIEW: "pending_review",
} as const;

export type StatusType = (typeof StatusType)[keyof typeof StatusType];

/**
 * Base extracted data interface
 */
export interface ExtractedData<T = unknown> {
  /** The original data that was extracted from the document. For tracking changes. Should not be updated. */
  originalData: T;
  /** The latest state of the data. Will differ if data has been updated. */
  data?: T;
  /** The status of the extracted data. Prefer to use the StatusType values, but any string is allowed. */
  status: StatusType | string;
  /** Confidence scores, if any, for each primitive field in the originalData data. */
  confidence?: Record<string, unknown>;
  /** The ID of the file that was used to extract the data. */
  fileId?: string;
  /** The name of the file that was used to extract the data. */
  fileName?: string;
  /** The hash of the file that was used to extract the data. */
  fileHash?: string;
  /** Additional metadata about the extracted data, such as errors, tokens, etc. */
  metadata?: Record<string, unknown>;
}
