import { Response } from './Response';
import { BaseQueryEngine } from './QueryEngine';

export class QueryResponseEvaluator {
  evaluate(query: string, response: Response, queryEngine: BaseQueryEngine): number {
    // Implement the evaluation logic here
    // This is a placeholder implementation that always returns 0
    return 0;
  }
}
