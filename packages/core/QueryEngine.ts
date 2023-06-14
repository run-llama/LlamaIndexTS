import { Response } from "./Response";

export class BaseQueryEngine {
  query(q: string): Response {
    return new Response();
  }

  aquery(q: string): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      resolve(new Response());
    });
  }
}
