import type { QueryType } from "@llamaindex/core/query-engine";
import type { Retriever } from "@llamaindex/core/retriever";
import { Document, type NodeWithScore } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import {
  listRetrieversApiV1RetrieversGet,
  retrieveApiV1RetrieversRetrieverIdRetrievePost,
  type CompositeRetrievalParams,
} from "./api";

type RetrieversParams =
  | {
      id: string;
    }
  | {
      name: string;
    };

export function compositeRetriever(params: RetrieversParams) {
  return {
    retrieve: async (
      query: QueryType,
      retrievalParams?: Omit<CompositeRetrievalParams, "query">,
    ): Promise<NodeWithScore[]> => {
      let retrieverId: string | null = null;
      if ("name" in params) {
        const result = await listRetrieversApiV1RetrieversGet({
          query: {
            name: params.name,
          },
          throwOnError: true,
        });
        const retriever = result.data.find(
          (retriever) => retriever.name === params.name,
        );
        if (retriever) {
          retrieverId = retriever.id;
        }
      } else {
        retrieverId = params.id;
      }
      if (!retrieverId) {
        throw new Error("Retriever not found");
      }
      const result = await retrieveApiV1RetrieversRetrieverIdRetrievePost({
        path: {
          retriever_id: retrieverId,
        },
        body: {
          ...retrievalParams,
          query: extractText(query),
        },
        throwOnError: true,
      });
      return (
        result.data.nodes?.map(({ node, score }) => ({
          node: new Document({
            text: node.text,
            metadata: node.metadata,
            startCharIdx: node.start_char_idx ?? undefined,
            endCharIdx: node.end_char_idx ?? undefined,
          }),
          score: score ?? undefined,
        })) ?? []
      );
    },
  } satisfies Retriever;
}
