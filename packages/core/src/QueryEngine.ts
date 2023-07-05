import { Response } from "./Response";
import { ResponseSynthesizer } from "./ResponseSynthesizer";
import { BaseRetriever } from "./Retriever";
import { ServiceContext } from "./ServiceContext";
import { v4 as uuidv4 } from "uuid";
import { Trace } from "./callbacks/CallbackManager";

export interface BaseQueryEngine {
  aquery(query: string): Promise<Response>;
}

export class RetrieverQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: ResponseSynthesizer;

  constructor(retriever: BaseRetriever) {
    this.retriever = retriever;
    const serviceContext: ServiceContext | undefined =
      this.retriever.getServiceContext();
    this.responseSynthesizer = new ResponseSynthesizer(serviceContext);
  }

  async aquery(query: string) {
    const parentTrace: Trace = {
      id: uuidv4(),
    };
    const nodes = await this.retriever.aretrieve(query, parentTrace);
    return this.responseSynthesizer.asynthesize(query, nodes, parentTrace);
  }
}
