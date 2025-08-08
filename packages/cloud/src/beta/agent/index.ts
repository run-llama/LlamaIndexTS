// Deprecation warning
console.warn(`
The package @llamaindex/cloud has been deprecated since version 4.1.0
 * Please migrate to llama-cloud-services.
 * See the documentation: https://docs.cloud.llamaindex.ai
`);

export { AgentClient, createAgentDataClient } from "./client";

export type {
  AggregateAgentDataOptions,
  ComparisonOperator,
  ExtractedData,
  FilterOperation,
  SearchAgentDataOptions,
  StatusType,
  TypedAgentData,
  TypedAgentDataItems,
  TypedAggregateGroup,
  TypedAggregateGroupItems,
} from "./types";

export { StatusType as StatusTypeEnum } from "./types";
