import {
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  type MetadataFilter,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";

import type { BaseNode, Metadata } from "@llamaindex/core/schema";
import {
  metadataDictToNode,
  nodeToMetadata,
} from "@llamaindex/core/vector-store";
import { getEnv } from "@llamaindex/env";
import type {
  FetchResponse,
  Index,
  PineconeRecord,
  QueryOptions,
  ScoredPineconeRecord,
} from "@pinecone-database/pinecone";
import { type Pinecone } from "@pinecone-database/pinecone";

type PineconeParams = {
  indexName?: string;
  chunkSize?: number;
  namespace?: string;
  textKey?: string;
  apiKey?: string;
} & VectorStoreBaseParams;

/**
 * Provides support for writing and querying vector data in Pinecone.
 */
export class PineconeVectorStore extends BaseVectorStore {
  storesText: boolean = true;

  /*
    FROM @pinecone-database/pinecone:
      PINECONE_API_KEY="your_api_key"
      PINECONE_ENVIRONMENT="your_environment"
    Our addition:
      PINECONE_INDEX_NAME="llama"
      PINECONE_CHUNK_SIZE=100
  */
  db?: Pinecone;
  indexName: string;
  namespace: string;
  chunkSize: number;
  textKey: string;

  apiKey: string;

  constructor(params?: PineconeParams) {
    super(params);
    this.indexName =
      params?.indexName ?? getEnv("PINECONE_INDEX_NAME") ?? "llama";
    this.namespace = params?.namespace ?? getEnv("PINECONE_NAMESPACE") ?? "";
    this.chunkSize =
      params?.chunkSize ??
      Number.parseInt(getEnv("PINECONE_CHUNK_SIZE") ?? "100");
    this.textKey = params?.textKey ?? "text";
    const apiKey = params?.apiKey ?? getEnv("PINECONE_API_KEY");
    if (!apiKey) {
      throw new Error("PINECONE_API_KEY is required");
    }
    this.apiKey = apiKey;
  }

  private async getDb(): Promise<Pinecone> {
    if (!this.db) {
      const { Pinecone } = await import("@pinecone-database/pinecone");
      this.db = new Pinecone({
        apiKey: this.apiKey,
      });
    }

    return Promise.resolve(this.db);
  }

  /**
   * Connects to the Pinecone account specified in environment vars.
   * This method also checks and creates the named index if not found.
   * @returns Pinecone client, or the error encountered while connecting/setting up.
   */
  client() {
    return this.getDb();
  }

  async index() {
    const db: Pinecone = await this.getDb();
    return db.index(this.indexName).namespace(this.namespace);
  }

  /**
   * Delete all records for the current index.
   * NOTE: This operation is not supported by Pinecone for "Starter" (free) indexes.
   * @returns The result of the delete query.
   */
  async clearIndex() {
    const idx = await this.index();
    return await idx.deleteAll();
  }

  /**
   * Adds vector record(s) to the table.
   * @TODO Does not create or insert sparse vectors.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns Due to limitations in the Pinecone client, does not return the upserted ID list, only a Promise resolve/reject.
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    if (embeddingResults.length == 0) {
      return [];
    }

    const idx: Index = await this.index();
    const nodes = embeddingResults.map((node) => {
      const nodeRecord = this.nodeToRecord(node);

      if (nodeRecord.metadata.ref_doc_id) {
        // adding refDoc id as prefix to the chunk to find them using refDoc id
        nodeRecord.id = `${nodeRecord.metadata.ref_doc_id}_chunk_${nodeRecord.id}`;
      }
      return nodeRecord;
    });

    for (let i = 0; i < nodes.length; i += this.chunkSize) {
      const chunk = nodes.slice(i, i + this.chunkSize);
      const result = await this.saveChunk(idx, chunk);
      if (!result) {
        throw new Error("Failed to save chunk");
      }
    }
    return [];
  }

  protected async saveChunk(idx: Index, chunk: PineconeRecord[]) {
    try {
      await idx.upsert(chunk);
      return true;
    } catch (err) {
      const msg = `${err}`;
      console.log(msg, err);
      return false;
    }
  }

  /**
   * Deletes a single record from the database by id.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param refDocId Unique identifier for the record to delete.
   * @param deleteKwargs Required by VectorStore interface.  Currently ignored.
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string, deleteKwargs?: object): Promise<void> {
    const idx = await this.index();
    try {
      await idx.deleteMany({
        metadata: {
          ref_doc_id: refDocId,
        },
      });
    } catch (e) {
      // fallback to deleting by prefix for serverless indexes
      // get the list of ids with the prefix
      let list = await idx.listPaginated({
        prefix: refDocId,
      });

      //do while loop to delete the document if there is no next paginationToken
      do {
        const ids = list?.vectors?.map((v) => v.id);

        if (ids && ids.length > 0) {
          await idx.deleteMany(ids);
        }

        if (list.pagination?.next) {
          list = await idx.listPaginated({
            prefix: refDocId,
            paginationToken: list.pagination?.next,
          });
        }
      } while (list.pagination?.next);
    }
  }

  /**
   * Query the vector store for the closest matching data to the query embeddings
   * @TODO QUERY TYPES
   * @param query The VectorStoreQuery to be used
   * @param _options Required by VectorStore interface.  Currently ignored.
   * @returns Zero or more Document instances with data from the vector store.
   */
  async query(
    query: VectorStoreQuery,
    _options?: object,
  ): Promise<VectorStoreQueryResult> {
    const filter = this.toPineconeFilter(query.filters);

    const defaultOptions: QueryOptions = {
      vector: query.queryEmbedding!,
      topK: query.similarityTopK,
      includeValues: true,
      includeMetadata: true,
    };

    if (filter) {
      defaultOptions.filter = filter;
    }

    const idx = await this.index();
    const results = await idx.query(defaultOptions);

    const idList = results.matches.map((row) => row.id);
    if (idList.length == 0) {
      return { nodes: [], similarities: [], ids: [] };
    }
    const records: FetchResponse = await idx.fetch(idList);
    const rows = Object.values(records.records);

    const nodes = rows.map((row) => {
      const node = metadataDictToNode(row.metadata ?? {}, {
        fallback: {
          id: row.id,
          text: this.textFromResultRow(row),
          metadata: this.metaWithoutText(row.metadata ?? {}),
          embedding: row.values,
        },
      });
      return node;
    });

    return {
      nodes: nodes,
      similarities: results.matches.map((row) => row.score || 999),
      ids: results.matches.map((row) => row.id),
    };
  }

  /**
   * Required by VectorStore interface.  Currently ignored.
   * @param persistPath
   * @returns Resolved Promise.
   */
  persist(persistPath: string): Promise<void> {
    return Promise.resolve();
  }

  toPineconeFilter(stdFilters?: MetadataFilters): object | undefined {
    if (stdFilters == null) return undefined;

    const transformCondition = (
      condition: `${FilterCondition}` = "and",
    ): string => {
      if (condition === "and") return "$and";
      if (condition === "or") return "$or";
      throw new Error(`Filter condition ${condition} not supported`);
    };

    const transformOperator = (operator: `${FilterOperator}`): string => {
      switch (operator) {
        case "!=":
          return "$ne";
        case "==":
          return "$eq";
        case ">":
          return "$gt";
        case "<":
          return "$lt";
        case ">=":
          return "$gte";
        case "<=":
          return "$lte";
        case "in":
          return "$in";
        case "nin":
          return "$nin";
        default:
          throw new Error(`Filter operator ${operator} not supported`);
      }
    };

    const convertFilterItem = (filter: MetadataFilter) => {
      return {
        [filter.key]: {
          [transformOperator(filter.operator)]: filter.value,
        },
      };
    };

    const convertFilter = (filter: MetadataFilters): object => {
      const filtersList = filter.filters
        .map((f) => convertFilterItem(f))
        .filter((f) => Object.keys(f).length > 0);

      if (filtersList.length === 0) return {};
      if (filtersList.length === 1) return filtersList[0] ?? {};

      const condition = transformCondition(filter.condition);
      return { [condition]: filtersList };
    };

    return convertFilter(stdFilters);
  }

  textFromResultRow(row: ScoredPineconeRecord<Metadata>): string {
    return row.metadata?.[this.textKey] ?? "";
  }

  metaWithoutText(meta: Metadata) {
    return Object.keys(meta)
      .filter((key) => key != this.textKey)
      .reduce<Record<string, unknown>>((acc, key: string) => {
        acc[key] = meta[key];
        return acc;
      }, {});
  }

  nodeToRecord(node: BaseNode<Metadata>) {
    const id = node.id_.length ? node.id_ : null;
    return {
      // fixme: why id is null?
      id: id!,
      values: node.getEmbedding(),
      metadata: nodeToMetadata(node),
    };
  }
}
