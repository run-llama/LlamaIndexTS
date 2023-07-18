import { NodeWithScore } from "./Node";
import { ServiceContext } from "./ServiceContext";
import { Event } from "./callbacks/CallbackManager";

/**
 * Retrievers retrieve the nodes that most closely match our query in similarity.
 */
export interface BaseRetriever {
  retrieve(query: string, parentEvent?: Event): Promise<NodeWithScore[]>;
  getServiceContext(): ServiceContext;
}
