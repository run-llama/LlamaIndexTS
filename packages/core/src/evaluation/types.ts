export interface EvaluationResult {
  query: string;
  contexts?: string[];
  response: string;
  score: number;
  scoreSecondary?: number;
  scoreSecondaryType?: string;
  meta?: any;
  passing: boolean;
  feedback: string;
}

export interface BaseEvaluator {
  evaluate(
    query: string,
    response: string,
    contexts?: string[],
    reference?: string,
  ): Promise<EvaluationResult>;
  evaluateResponse(
    query: string,
    response: Response,
  ): Promise<EvaluationResult>;
}
