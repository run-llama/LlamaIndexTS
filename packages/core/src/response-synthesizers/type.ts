import type { QueryType } from "../query-engine";
import { EngineResponse, type NodeWithScore } from "../schema";

export type SynthesizeQuery = {
  query: QueryType;
  nodes: NodeWithScore[];
  additionalSourceNodes?: NodeWithScore[];
};

export type SynthesizeStartEvent = {
  id: string;
  query: SynthesizeQuery;
};

export type SynthesizeEndEvent = {
  id: string;
  query: SynthesizeQuery;
  response: EngineResponse | AsyncIterable<EngineResponse>;
};
