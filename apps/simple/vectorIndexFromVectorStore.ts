import {
  OpenAI,
  ResponseSynthesizer,
  RetrieverQueryEngine,
  serviceContextFromDefaults,
  TextNode,
  TreeSummarize,
  VectorIndexRetriever,
  VectorStore,
  VectorStoreIndex,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "llamaindex";

import { Index, Pinecone, RecordMetadata } from "@pinecone-database/pinecone";

/**
 * Please do not use this class in production; it's only for demonstration purposes.
 */
class PineconeVectorStore<T extends RecordMetadata = RecordMetadata>
  implements VectorStore
{
  storesText = true;
  isEmbeddingQuery = false;

  indexName!: string;
  pineconeClient!: Pinecone;
  index!: Index<T>;

  constructor({ indexName, client }: { indexName: string; client: Pinecone }) {
    this.indexName = indexName;
    this.pineconeClient = client;
    this.index = client.index<T>(indexName);
  }

  client() {
    return this.pineconeClient;
  }

  async query(
    query: VectorStoreQuery,
    kwargs?: any,
  ): Promise<VectorStoreQueryResult> {
    let queryEmbedding: number[] = [];
    if (query.queryEmbedding) {
      if (typeof query.alpha === "number") {
        const alpha = query.alpha;
        queryEmbedding = query.queryEmbedding.map((v) => v * alpha);
      } else {
        queryEmbedding = query.queryEmbedding;
      }
    }

    // Current LlamaIndexTS implementation only support exact match filter, so we use kwargs instead.
    const filter = kwargs?.filter || {};

    const response = await this.index.query({
      filter,
      vector: queryEmbedding,
      topK: query.similarityTopK,
      includeValues: true,
      includeMetadata: true,
    });

    console.log(
      `Numbers of vectors returned by Pinecone after preFilters are applied: ${
        response?.matches?.length || 0
      }.`,
    );

    const topKIds: string[] = [];
    const topKNodes: TextNode[] = [];
    const topKScores: number[] = [];

    const metadataToNode = (metadata?: T): Partial<TextNode> => {
      if (!metadata) {
        throw new Error("metadata is undefined.");
      }

      const nodeContent = metadata["_node_content"];
      if (!nodeContent) {
        throw new Error("nodeContent is undefined.");
      }

      if (typeof nodeContent !== "string") {
        throw new Error("nodeContent is not a string.");
      }

      return JSON.parse(nodeContent);
    };

    if (response.matches) {
      for (const match of response.matches) {
        const node = new TextNode({
          ...metadataToNode(match.metadata),
          embedding: match.values,
        });

        topKIds.push(match.id);
        topKNodes.push(node);
        topKScores.push(match.score ?? 0);
      }
    }

    const result = {
      ids: topKIds,
      nodes: topKNodes,
      similarities: topKScores,
    };

    return result;
  }

  add(): Promise<string[]> {
    return Promise.resolve([]);
  }

  delete(): Promise<void> {
    throw new Error("Method `delete` not implemented.");
  }

  persist(): Promise<void> {
    throw new Error("Method `persist` not implemented.");
  }
}

/**
 * The goal of this example is to show how to use Pinecone as a vector store
 * for LlamaIndexTS with(out) preFilters.
 *
 * It should not be used in production like that,
 * as you might want to find a proper PineconeVectorStore implementation.
 */
async function main() {
  process.env.PINECONE_API_KEY = "Your Pinecone API Key.";
  process.env.PINECONE_ENVIRONMENT = "Your Pinecone Environment.";
  process.env.PINECONE_PROJECT_ID = "Your Pinecone Project ID.";
  process.env.PINECONE_INDEX_NAME = "Your Pinecone Index Name.";
  process.env.OPENAI_API_KEY = "Your OpenAI API Key.";
  process.env.OPENAI_API_ORGANIZATION = "Your OpenAI API Organization.";

  const getPineconeVectorStore = async () => {
    return new PineconeVectorStore({
      indexName: process.env.PINECONE_INDEX_NAME || "index-name",
      client: new Pinecone(),
    });
  };

  const getServiceContext = () => {
    const openAI = new OpenAI({
      model: "gpt-4",
      apiKey: process.env.OPENAI_API_KEY,
    });

    return serviceContextFromDefaults({
      llm: openAI,
    });
  };

  const getQueryEngine = async (filter: unknown) => {
    const vectorStore = await getPineconeVectorStore();
    const serviceContext = getServiceContext();

    const vectorStoreIndex = await VectorStoreIndex.fromVectorStore(
      vectorStore,
      serviceContext,
    );

    const retriever = new VectorIndexRetriever({
      index: vectorStoreIndex,
      similarityTopK: 500,
    });

    const responseSynthesizer = new ResponseSynthesizer({
      serviceContext,
      responseBuilder: new TreeSummarize(serviceContext),
    });

    return new RetrieverQueryEngine(retriever, responseSynthesizer, {
      filter,
    });
  };

  // whatever is a key from your metadata
  const queryEngine = await getQueryEngine({
    whatever: {
      $gte: 1,
      $lte: 100,
    },
  });

  const response = await queryEngine.query("How many results do you have?");

  console.log(response.toString());
}

main().catch(console.error);
