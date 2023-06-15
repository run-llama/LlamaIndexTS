import { Response } from "./Response";

export class BaseQueryEngine {
  async aquery(q: string): Promise<Response> {
    return new Response();
  }
}
