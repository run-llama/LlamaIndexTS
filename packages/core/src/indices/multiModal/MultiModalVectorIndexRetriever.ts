import { NodeWithScore } from "../../Node";
import { Event } from "../../callbacks/CallbackManager";
import { VectorIndexRetriever, VectorStoreIndex } from "../vectorStore";
import { MultiModalVectorStoreIndex } from "./MultiModalVectorStoreIndex";

export class MultiModalVectorIndexRetriever extends VectorIndexRetriever {
  constructor(props: { index: VectorStoreIndex; similarityTopK?: number }) {
    super(props);
  }

  async retrieve(
    query: string,
    parentEvent?: Event,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]> {
    const res = await this.textRetrieve(query, preFilters);
    const nodesWithScores = res.concat(
      await this.imageRetrieve(query, preFilters),
    );
    this.sendEvent(query, nodesWithScores, parentEvent);
    return nodesWithScores;
  }

  private async imageRetrieve(query: string, preFilters?: unknown) {
    const index = this.index as MultiModalVectorStoreIndex;
    const q = await this.buildVectorStoreQuery(index.imageEmbedModel, query);
    const result = await index.imageVectorStore.query(q, preFilters);
    return this.buildNodeListFromQueryResult(result);
  }
}
