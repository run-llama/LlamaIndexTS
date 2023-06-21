import { Response } from "./Response";
import { ResponseSynthesizer } from "./ResponseSynthesizer";
import { BaseRetriever } from "./Retriever";

export interface BaseQueryEngine {
  aquery(query: string): Promise<Response>;
}

export class RetrieverQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: ResponseSynthesizer;

  constructor(retriever: BaseRetriever) {
    this.retriever = retriever;
    this.responseSynthesizer = new ResponseSynthesizer();
  }

  async aquery(query: string) {
    const nodes = await this.retriever.aretrieve(query);
    return this.responseSynthesizer.asynthesize(query, nodes);
  }
}
