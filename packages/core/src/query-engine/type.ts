import { EngineResponse } from "../schema";
import type { QueryType } from "./base";

export type QueryStartEvent = {
  id: string;
  query: QueryType;
};

export type QueryEndEvent = {
  id: string;
  response: EngineResponse | AsyncIterable<EngineResponse>;
};
