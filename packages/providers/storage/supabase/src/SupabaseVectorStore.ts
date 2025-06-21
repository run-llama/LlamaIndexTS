import type { BaseNode } from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  metadataDictToNode,
  nodeToMetadata,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";
import { getEnv } from "@llamaindex/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MetadataMode } from "../../../../core/schema/dist/index.cjs";

export interface SupabaseVectorStoreInit extends VectorStoreBaseParams {
  client?: SupabaseClient;
  supabaseUrl?: string;
  supabaseKey?: string;
  table: string;
}

interface SearchEmbeddingsResponse {
  id: string;
  content: string;
  metadata: object;
  embedding: number[];
  similarity: number;
}

export class SupabaseVectorStore extends BaseVectorStore {
  storesText: boolean = true;
  private flatMetadata: boolean = false;
  private supabaseClient: SupabaseClient;
  private table: string;

  /**
   * Creates a new instance of SupabaseVectorStore
   * @param init Configuration object containing either a Supabase client or URL/key pair, and table name
   * @throws Error if neither client nor valid URL/key pair is provided
   */
  constructor(init: SupabaseVectorStoreInit) {
    super(init);
    this.table = init.table;
    if (init.client) {
      this.supabaseClient = init.client;
    } else {
      const supabaseUrl = init.supabaseUrl || getEnv("SUPABASE_URL");
      const supabaseKey = init.supabaseKey || getEnv("SUPABASE_KEY");
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          "Must specify SUPABASE_URL and SUPABASE_KEY via env variable if not directly passing in client.",
        );
      }
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Returns the Supabase client instance used by this vector store
   * @returns The configured Supabase client
   */
  public client() {
    return this.supabaseClient;
  }

  /**
   * Adds an array of nodes to the vector store
   * @param nodes Array of BaseNode objects to store
   * @returns Array of node IDs that were successfully stored
   * @throws Error if the insertion fails
   */
  public async add(nodes: BaseNode[]): Promise<string[]> {
    if (!nodes.length) {
      return [];
    }

    const dataToInsert = nodes.map((node) => {
      const metadata = nodeToMetadata(node, true, "text", this.flatMetadata);

      return {
        id: node.id_,
        content: node.getContent(MetadataMode.NONE),
        embedding: node.getEmbedding(),
        metadata,
      };
    });

    const { data, error } = await this.supabaseClient
      .from(this.table)
      .insert(dataToInsert);

    if (error) {
      throw new Error(
        `Error inserting documents: ${JSON.stringify(error, null, 2)}`,
      );
    }

    return nodes.map((node) => node.id_);
  }

  /**
   * Deletes documents from the vector store based on the reference document ID
   * @param refDocId The reference document ID to delete
   * @param deleteOptions Optional parameters for the delete operation
   * @throws Error if the deletion fails
   */
  public async delete(refDocId: string, deleteOptions?: object): Promise<void> {
    const { error } = await this.supabaseClient
      .from(this.table)
      .delete()
      .eq("metadata->>ref_doc_id", refDocId);
    if (error) {
      throw new Error(
        `Error deleting document with id ${refDocId}: ${JSON.stringify(
          error,
          null,
          2,
        )}`,
      );
    }
  }

  /**
   * Queries the vector store for similar documents
   * @param query Query parameters including the query embedding and number of results to return
   * @param options Optional parameters for the query operation
   * @returns Object containing matched nodes, similarity scores, and document IDs
   * @throws Error if query embedding is not provided or if the query fails
   */
  public async query(
    query: VectorStoreQuery,
    options?: object,
  ): Promise<VectorStoreQueryResult> {
    
    console.log("query is called !");
    if (!query.queryEmbedding) {
      throw new Error("Query embedding is required");
    }

    const { data, error } = await this.supabaseClient.rpc("match_documents", {
      query_embedding: query.queryEmbedding,
      match_count: query.similarityTopK,
    });

    if (error) {
      throw new Error(
        `Error querying vector store: ${JSON.stringify(error, null, 2)}`,
      );
    }

    const searchedEmbeddingResponses = data || [];
    const nodes = searchedEmbeddingResponses.map(
      (item: SearchEmbeddingsResponse) => {
        const node = metadataDictToNode(item.metadata ?? {}, {
          fallback: {
            id: item.id,
            text: item.content,
            metadata: item.metadata,
          },
        });
        node.embedding = item.embedding;
        node.setContent(item.content);
        return node;
      },
    );

    const similarities = searchedEmbeddingResponses.map(
      (item: SearchEmbeddingsResponse) => {
        const distance = item.similarity || 0;
        return 1 - distance;
      },
    );

    return {
      nodes,
      similarities,
      ids: searchedEmbeddingResponses.map(
        (item: SearchEmbeddingsResponse) => item.id,
      ),
    };
  }
}
