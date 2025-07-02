import type { QueryBundle } from "@llamaindex/core/query-engine";
import { BaseRetriever } from "@llamaindex/core/retriever";
import {
  MetadataMode,
  type BaseNode,
  type NodeWithScore,
} from "@llamaindex/core/schema";
import type { BaseDocumentStore } from "@llamaindex/core/storage/doc-store";
import { extractText } from "@llamaindex/core/utils";
import BM25 from "okapibm25";

export type Bm25RetrieverOptions = {
  docStore: BaseDocumentStore;
  topK?: number;
  docIds?: string[];
};

export class Bm25Retriever extends BaseRetriever {
  private docStore: BaseDocumentStore;
  private topK: number;
  private docIds: string[];

  constructor(options: Bm25RetrieverOptions) {
    super();
    this.topK = options.topK || 10;
    this.docStore = options.docStore;
    this.docIds = options.docIds || [];
  }

  async _retrieve(params: QueryBundle): Promise<NodeWithScore[]> {
    let nodes: BaseNode[] = [];
    const { query } = params;
    const queryStr = extractText(query);
    if (this.docIds?.length) {
      nodes = (
        await Promise.all(
          this.docIds.map((id) => this.docStore.getDocument(id, false)),
        )
      ).filter((x) => !!x);
    } else {
      nodes = Object.values(await this.docStore.docs());
    }
    const contents = nodes.map(
      (node) => node.getContent(MetadataMode.NONE) || "",
    );
    const scores = BM25(
      contents,
      queryStr.toLowerCase().split(/\s+/),
    ) as number[];

    const scoredNodes = nodes.map((node, i) => ({
      node,
      score: scores[i] || 0,
    }));
    scoredNodes.sort((a, b) => b.score - a.score);
    return scoredNodes.slice(0, this.topK);
  }
}
