import { client } from "./client/client.gen";

client.setConfig({
  baseUrl: "https://api.cloud.llamaindex.ai/",
  headers: {
    "X-SDK-Name": "llamaindex-ts",
  },
});

export {
  AsyncAgentDataClient,
  createAgentDataClient,
  StatusTypeEnum,
  type AgentDataT,
  type CreateAgentDataOptions,
  type ExtractedData,
  type ExtractedT,
  type ExtractOptions,
  type ListAgentDataOptions,
  type SortOptions,
  type StatusType,
  type TypedAgentData,
  type TypedAgentDataItems,
  type UpdateAgentDataOptions,
} from "./agent";
export * from "./client";
export { client };
