import { Response } from './Response';
import { BaseQueryEngine } from './QueryEngine';
import { ResponseEvaluator } from './ResponseEvaluator';

export class QueryResponseEvaluator {
  evaluate(query: string, response: Response, queryEngine: BaseQueryEngine): number {
    const evaluator = new ResponseEvaluator(queryEngine);
    const binaryEvaluation = evaluator.binaryEvaluation(query, response);
    const nodeEvaluation = evaluator.nodeEvaluation(query, response);
    return binaryEvaluation && nodeEvaluation ? 1 : 0;
  }
}
