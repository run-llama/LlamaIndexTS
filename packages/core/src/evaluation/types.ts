import { Response } from "../Response.js";

export type EvaluationResult = {
  query?: string;
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
  query: string | null;
  response: string;
  contexts?: string[];
  reference?: string;
  sleepTimeInSeconds?: number;
};

export type EvaluatorResponseParams = {
  query: string | null;
  response: Response;
};
export interface BaseEvaluator {
  evaluate(params: EvaluatorParams): Promise<EvaluationResult>;
  evaluateResponse?(params: EvaluatorResponseParams): Promise<EvaluationResult>;
}
