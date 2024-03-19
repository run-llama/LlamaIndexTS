import type mysql from "mysql2/promise";
import type { PoolOptions, RowDataPacket } from "mysql2/promise";

import type {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "./types.js";

import type { GenericFileSystem } from "@llamaindex/env";
import type { BaseNode, Metadata } from "../../Node.js";
import { Document, MetadataMode } from "../../Node.js";

export const TIDB_VECTOR_TABLE = "llamaindex_embedding";

interface DocumentEmbedding extends RowDataPacket {
  id: string;
  document: string;
  metadata: Metadata;
  embeddings: number[];
  score: number;
}

/**
 * Provides support for writing and querying vector data in TiDB.
 */
export class TiDBVectorStore implements VectorStore {
  storesText: boolean = true;

  private namespace: string = "";
  private tableName: string = TIDB_VECTOR_TABLE;
  private poolOptions: PoolOptions = {};
  private dimensions: number = 1536;

  private db?: mysql.Pool;

  /**
   * Constructs a new instance of the TiDBVectorStore
   *
   * @param {object} config - The configuration settings for the instance.
   * @param {string} config.tableName - The name of the table (optional). Defaults to TIDB_VECTOR_TABLE.
   * @param {number} config.dimensions - The dimensions of the embedding model.
   * @param {string} config.poolOptions - The pool options for the TiDB connection.
   */
  constructor(config?: {
    namespace?: string;
    tableName?: string;
    dimensions?: number;
    poolOptions?: PoolOptions;
    client?: mysql.Pool;
  }) {
    this.tableName = config?.tableName ?? TIDB_VECTOR_TABLE;
    this.namespace = config?.namespace ?? "";
    this.dimensions = config?.dimensions ?? 1536;
    this.poolOptions = config?.poolOptions ?? {};
    if (config?.client) {
      this.db = config.client;
    }
  }

  /**
   * Setter for the namespace property.
   * Using a namespace allows for simple segregation of vector data,
   * e.g. by user, source, or access-level.
   * Leave/set blank to ignore the namespace value when querying.
   * @param namespace Name for the namespace.
   */
  setNamespace(namespace: string) {
    const name = this.formatNamespace(namespace);
    if (name.length > 64 || name.length == 0) {
      throw new Error(
        "Invalid namespace: " + name + ", must be 1-64 characters length.",
      );
    }
    this.namespace = name;
  }

  /**
   * Getter for the namespace property.
   * Using a namespace allows for simple segregation of vector data,
   * e.g. by user, source, or access-level.
   * Leave/set blank to ignore the namespace value when querying.
   * @returns The currently-set namespace value.  Default is empty string.
   */
  getNamespace(): string {
    return this.namespace;
  }

  private async getDb(): Promise<mysql.Pool> {
    if (!this.db) {
      try {
        const { createPool } = await import("mysql2/promise");
        // Create DB connection
        // Read connection params from env - see comment block above
        const db = createPool(this.poolOptions);

        // Check schema, table(s), index(es)
        await this.checkSchema(db);

        // All good?  Keep the connection reference
        this.db = db;
      } catch (err: any) {
        console.error(err);
        return Promise.reject(err);
      }
    }

    return Promise.resolve(this.db);
  }

  private async checkSchema(db: mysql.Pool) {
    const tbl = `CREATE TABLE IF NOT EXISTS ${this.tableName}(
      namespace VARCHAR(64),
      id BINARY(16),
      external_id VARCHAR(100),
      document TEXT,
      metadata JSON,
      embeddings VECTOR(${this.dimensions}) NOT NULL COMMENT 'hnsw(distance=cosine)',
      PRIMARY KEY (namespace, id),
    )
    PARTITION BY LIST COLUMNS (namespace) (
      PARTITION p_default DEFAULT
    );`;
    await db.query(tbl);

    if (this.namespace.length == 0) {
      const partition = `ALTER TABLE ${this.tableName} ADD PARTITION IF NOT EXISTS (PARTITION p_${this.namespace} VALUES IN ('${this.namespace}'));`;
      await db.query(partition);
    }

    return db;
  }

  /**
   * Connects to the database specified in environment vars.
   * This method also checks and creates the vector extension,
   * the destination table and indexes if not found.
   * @returns A connection to the database, or the error encountered while connecting/setting up.
   */
  client() {
    return this.getDb();
  }

  /**
   * Delete all vector records for the specified namespace.
   * @returns The result of the delete query.
   */
  async clearNamespace() {
    const sql: string = `DELETE FROM ${this.tableName} WHERE namespace = $1`;
    const db = await this.getDb();
    return db.query(sql, [this.namespace]);
  }

  private getDataToInsert(embeddingResults: BaseNode<Metadata>[]) {
    const result = [];
    for (let index = 0; index < embeddingResults.length; index++) {
      const row = embeddingResults[index];

      const id: any = row.id_.length ? row.id_ : null;
      const externalId = "";
      const document = row.getContent(MetadataMode.EMBED);
      const meta = row.metadata || {};
      meta.create_date = new Date();
      const embeddings = this.vectorToSQL(row.getEmbedding());

      const params = [
        this.namespace,
        id,
        externalId,
        document,
        meta,
        embeddings,
      ];

      result.push(params);
    }
    return result;
  }

  /**
   * Adds vector record(s) to the table.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns A list of zero or more id values for the created records.
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    if (embeddingResults.length == 0) {
      console.debug("Empty list sent to TiDBVectorStore::add");
      return Promise.resolve([]);
    }

    const sql: string = `INSERT INTO ${this.tableName} (namespace, id, external_id, document, metadata, embeddings) VALUES ($1, $2, $3, $4, $5, $6)`;
    const db = await this.getDb();
    const data = this.getDataToInsert(embeddingResults);

    const ret: string[] = [];
    for (let index = 0; index < data.length; index++) {
      const params = data[index];
      try {
        const [rows] = await db.query<DocumentEmbedding[]>(sql, params);
        if (rows.length) {
          const id = rows[0].id as string;
          ret.push(id);
        }
      } catch (err) {
        const msg = `${err}`;
        console.log(msg, err);
      }
    }

    return Promise.resolve(ret);
  }

  /**
   * Deletes a single record from the database by id.
   * @param refDocId Unique identifier for the record to delete.
   * @param deleteKwargs Required by VectorStore interface.  Currently ignored.
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string, deleteKwargs?: any): Promise<void> {
    const namespaceCriteria = this.namespace.length ? "AND namespace = $2" : "";
    const sql: string = `DELETE FROM ${this.tableName} WHERE id = $1 ${namespaceCriteria}`;
    const db = await this.getDb();
    const params = this.namespace.length
      ? [refDocId, this.namespace]
      : [refDocId];
    await db.query(sql, params);
    return Promise.resolve();
  }

  /**
   * Query the vector store for the closest matching data to the query embeddings
   * @param query The VectorStoreQuery to be used
   * @param options Required by VectorStore interface.  Currently ignored.
   * @returns Zero or more Document instances with data from the vector store.
   */
  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    const embedding = this.vectorToSQL(query.queryEmbedding);
    const max = query.similarityTopK ?? 2;
    const whereClauses = options.namespace ? ["namespace = $2"] : [];

    const params: Array<string | number> = options.namespace
      ? [embedding, options.namespace]
      : [embedding];

    query.filters?.filters.forEach((filter, index) => {
      const paramIndex = params.length + 1;
      whereClauses.push(`metadata->>'${filter.key}' = $${paramIndex}`);
      params.push(filter.value);
    });

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `SELECT 
        v.*, 
        VEC_COSINE_DISTINCE(embeddings, $1) AS score
      FROM ${this.tableName} v
      ${where}
      ORDER BY score
      LIMIT ${max}
    `;

    const db = await this.getDb();
    const [rows] = await db.query<DocumentEmbedding[]>(sql, params);
    const nodes = rows.map((row) => {
      return new Document({
        id_: row.id,
        text: row.document,
        metadata: row.metadata,
        embedding: row.embeddings,
      });
    });

    const ret = {
      nodes: nodes,
      similarities: rows.map((row) => row.score),
      ids: rows.map((row) => row.id),
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

  /**
   * Converts a vector to a SQL string.
   * @param vector The vector to convert.
   */
  vectorToSQL(vector?: number[]): string {
    return "[" + vector?.join(",") + "]";
  }

  /**
   * Formats a namespace string to a valid SQL identifier.
   * @param namespace
   */
  formatNamespace(namespace: string): string {
    namespace = namespace.toLowerCase();

    // Replace non-alphanumeric characters with underscores.
    namespace = namespace.replace(/\W+/g, "_");

    // Remove leading/trailing underscores.
    namespace = namespace.replace(/^_+|_+$/g, "");

    return namespace;
  }
}
