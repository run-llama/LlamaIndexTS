import type { QueryType } from "@llamaindex/core/query-engine";
import type { EngineResponse } from "@llamaindex/core/schema";

export type EvaluationResult = {
  query?: QueryType;
  contexts?: string[];
  response: string | null;
  score: number;
  scoreSecondary?: number;
  scoreSecondaryType?: string;
  meta?: any;
  passing: boolean;
  feedback: string;
};

export type EvaluatorParams = {
  query: QueryType;
  response: string;
  contexts?: string[];
  reference?: string;
  sleepTimeInSeconds?: number;
};

export type EvaluatorResponseParams = {
  query: QueryType;
  response: EngineResponse;
};
export interface BaseEvaluator {
  evaluate(params: EvaluatorParams): Promise<EvaluationResult>;
  evaluateResponse?(params: EvaluatorResponseParams): Promise<EvaluationResult>;
}
