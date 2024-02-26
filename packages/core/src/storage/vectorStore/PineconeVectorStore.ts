import type {
  ExactMatchFilter,
  MetadataFilters,
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "./types.js";

import type { GenericFileSystem } from "@llamaindex/env";
import type {
  FetchResponse,
  Index,
  ScoredPineconeRecord,
} from "@pinecone-database/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import type { BaseNode, Metadata } from "../../Node.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

type PineconeParams = {
  indexName?: string;
  chunkSize?: number;
};

/**
 * Provides support for writing and querying vector data in Postgres.
 */
export class PineconeVectorStore implements VectorStore {
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
  chunkSize: number;

  constructor(params?: PineconeParams) {
    this.indexName =
      params?.indexName ?? process.env.PINECONE_INDEX_NAME ?? "llama";
    this.chunkSize =
      params?.chunkSize ??
      Number.parseInt(process.env.PINECONE_CHUNK_SIZE ?? "100");
  }

  private async getDb(): Promise<Pinecone> {
    if (!this.db) {
      this.db = await new Pinecone();
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
    return await db.index(this.indexName);
  }

  /**
   * Delete all records for the current index.
   * NOTE: This operation is not supported by Pinecone for "Starter" (free) indexes.
   * @returns The result of the delete query.
   */
  async clearIndex() {
    const db: Pinecone = await this.getDb();
    return await db.index(this.indexName).deleteAll();
  }

  /**
   * Adds vector record(s) to the table.
   * @TODO Does not create or insert sparse vectors.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns Due to limitations in the Pinecone client, does not return the upserted ID list, only a Promise resolve/reject.
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    if (embeddingResults.length == 0) {
      return Promise.resolve([]);
    }

    const idx: Index = await this.index();
    const nodes = embeddingResults.map(this.nodeToRecord);

    for (let i = 0; i < nodes.length; i += this.chunkSize) {
      const chunk = nodes.slice(i, i + this.chunkSize);
      const result = await this.saveChunk(idx, chunk);
      if (!result) {
        return Promise.reject();
      }
    }
    return Promise.resolve([]);
  }

  protected async saveChunk(idx: Index, chunk: any) {
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
  async delete(refDocId: string, deleteKwargs?: any): Promise<void> {
    const idx = await this.index();
    return idx.deleteOne(refDocId);
  }

  /**
   * Query the vector store for the closest matching data to the query embeddings
   * @TODO QUERY TYPES
   * @param query The VectorStoreQuery to be used
   * @param options Required by VectorStore interface.  Currently ignored.
   * @returns Zero or more Document instances with data from the vector store.
   */
  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    const filter = this.toPineconeFilter(query.filters);

    var options: any = {
      vector: query.queryEmbedding,
      topK: query.similarityTopK,
      includeValues: true,
      includeMetadata: true,
      filter: filter,
    };

    const idx = await this.index();
    const results = await idx.query(options);

    const idList = results.matches.map((row) => row.id);
    const records: FetchResponse<any> = await idx.fetch(idList);
    const rows = Object.values(records.records);

    const nodes = rows.map((row) => {
      const metadata = this.metaWithoutText(row.metadata);
      const text = this.textFromResultRow(row);
      const node = metadataDictToNode(metadata, {
        fallback: {
          id: row.id,
          text,
          metadata,
          embedding: row.values,
        },
      });
      node.setContent(text);
      return node;
    });

    const ret = {
      nodes: nodes,
      similarities: results.matches.map((row) => row.score || 999),
      ids: results.matches.map((row) => row.id),
    };

    return Promise.resolve(ret);
  }

  /**
   * Required by VectorStore interface.  Currently ignored.
   * @param persistPath
   * @param fs
   * @returns Resolved Promise.
   */
  persist(
    persistPath: string,
    fs?: GenericFileSystem | undefined,
  ): Promise<void> {
    return Promise.resolve();
  }

  toPineconeFilter(stdFilters?: MetadataFilters) {
    return stdFilters?.filters?.reduce((carry: any, item: ExactMatchFilter) => {
      carry[item.key] = item.value;
      return carry;
    }, {});
  }

  textFromResultRow(row: ScoredPineconeRecord<Metadata>): string {
    return row.metadata?.text ?? "";
  }

  metaWithoutText(meta: Metadata): any {
    return Object.keys(meta)
      .filter((key) => key != "text")
      .reduce((acc: any, key: string) => {
        acc[key] = meta[key];
        return acc;
      }, {});
  }

  nodeToRecord(node: BaseNode<Metadata>) {
    const id: any = node.id_.length ? node.id_ : null;
    return {
      id: id,
      values: node.getEmbedding(),
      metadata: nodeToMetadata(node),
    };
  }
}
