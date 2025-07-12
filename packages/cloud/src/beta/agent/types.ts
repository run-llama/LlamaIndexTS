// Re-export types from the client
export type {
  AgentData,
  AggregateGroup,
  AggregateRequest,
  FilterOperation,
  PaginatedResponseAgentData,
  PaginatedResponseAggregateGroup,
  SearchRequest,
} from "../../client";

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
  original_data: T;
  /** The latest state of the data. Will differ if data has been updated. */
  data?: T;
  /** The status of the extracted data. Prefer to use the StatusType values, but any string is allowed. */
  status: StatusType | string;
  /** Confidence scores, if any, for each primitive field in the original_data data. */
  confidence?: Record<string, unknown>;
  /** The ID of the file that was used to extract the data. */
  file_id?: string;
  /** The name of the file that was used to extract the data. */
  file_name?: string;
  /** The hash of the file that was used to extract the data. */
  file_hash?: string;
  /** Additional metadata about the extracted data, such as errors, tokens, etc. */
  metadata?: Record<string, unknown>;
}
