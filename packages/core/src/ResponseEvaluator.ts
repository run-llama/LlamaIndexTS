import { Response } from './Response';
import { BaseNode } from './Node';

export class ResponseEvaluator {
  binaryEvaluation(response: Response, context: string): boolean {
    return response.toString() === context;
  }

  nodeEvaluation(query: string, node: BaseNode): boolean {
    return node.toString().includes(query);
  }
}
