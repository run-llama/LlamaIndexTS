import type { BaseNode } from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  FilterOperator,
  metadataDictToNode,
  nodeToMetadata,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";
import { getEnv } from "@llamaindex/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseVectorStoreInit extends VectorStoreBaseParams {
  client?: SupabaseClient;
  supabaseUrl?: string;
  supabaseKey?: string;
  table: string;
}

export class SupabaseVectorStore extends BaseVectorStore {
  storesText: boolean = true;
  private flatMetadata: boolean = false;
  private supabaseClient: SupabaseClient;
  private table: string;

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

  public client() {
    return this.supabaseClient;
  }

  public async add(nodes: BaseNode[]): Promise<string[]> {
    if (!nodes.length) {
      return [];
    }

    const dataToInsert = nodes.map((node) => {
      const metadata = nodeToMetadata(node, true, "text", this.flatMetadata);

      return {
        id: node.id_,
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

  public async delete(refDocId: string, deleteOptions?: object): Promise<void> {
    const { error } = await this.supabaseClient
      .from(this.table)
      .delete()
      .eq("metadata->ref_doc_id", refDocId);
    if (error) {
      throw new Error(`Error deleting document with id ${refDocId}: ${error}`);
    }
  }

  public async query(
    query: VectorStoreQuery,
    options?: object,
  ): Promise<VectorStoreQueryResult> {
    if (!query.queryEmbedding) {
      throw new Error("Query embedding is required");
    }

    let supabaseQuery = this.supabaseClient
      .from(this.table)
      .select("*")
      .order("embedding <=> '[" + query.queryEmbedding.join(",") + "]'")
      .limit(query.similarityTopK);

    // Add metadata filters if present
    if (query.filters?.filters) {
      for (const filter of query.filters.filters) {
        supabaseQuery = supabaseQuery.filter(
          `metadata->'${filter.key}'`,
          this.toPostgresOperator(filter.operator),
          filter.value,
        );
      }
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      throw new Error(
        `Error querying vector store: ${JSON.stringify(error, null, 2)}`,
      );
    }

    console.log("data", data);

    const nodes = (data || []).map((item) => {
      return metadataDictToNode(item.metadata ?? {}, {
        fallback: {
          id: item.id,
          text: item.content,
          metadata: item.metadata,
        },
      });
    });

    // Calculate similarities using cosine distance
    const similarities = (data || []).map((item) => {
      const distance = item.similarity || 0;
      return 1 - distance;
    });

    return {
      nodes,
      similarities,
      ids: (data || []).map((item) => item.id),
    };
  }

  private toPostgresOperator(operator: `${FilterOperator}`) {
    if (operator === FilterOperator.EQ) {
      return "=";
    }
    if (operator === FilterOperator.GT) {
      return ">";
    }
    if (operator === FilterOperator.LT) {
      return "<";
    }
    if (operator === FilterOperator.NE) {
      return "!=";
    }
    if (operator === FilterOperator.GTE) {
      return ">=";
    }
    if (operator === FilterOperator.LTE) {
      return "<=";
    }
    if (operator === FilterOperator.IN) {
      return "= ANY";
    }
    if (operator === FilterOperator.NIN) {
      return "!= ANY";
    }
    if (operator === FilterOperator.CONTAINS) {
      return "@>";
    }
    if (operator === FilterOperator.ANY) {
      return "?|";
    }
    if (operator === FilterOperator.ALL) {
      return "?&";
    }
    // fallback to "="
    return "=";
  }
}
