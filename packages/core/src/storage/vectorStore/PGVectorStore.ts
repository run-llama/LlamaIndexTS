import pg from "pg";
import pgvector from "pgvector/pg";

import {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "./types.js";

import { GenericFileSystem } from "@llamaindex/env/type";
import { BaseNode, Document, Metadata, MetadataMode } from "../../Node.js";

export const PGVECTOR_SCHEMA = "public";
export const PGVECTOR_TABLE = "llamaindex_embedding";

/**
 * Provides support for writing and querying vector data in Postgres.
 * Note: Can't be used with data created using the Python version of the vector store (https://docs.llamaindex.ai/en/stable/examples/vector_stores/postgres.html)
 */
export class PGVectorStore implements VectorStore {
  storesText: boolean = true;

  private collection: string = "";
  private schemaName: string = PGVECTOR_SCHEMA;
  private tableName: string = PGVECTOR_TABLE;
  private connectionString: string | undefined = undefined;
  private dimensions: number = 1536;

  private db?: pg.Client;

  /**
   * Constructs a new instance of the PGVectorStore
   *
   * If the `connectionString` is not provided the following env variables are
   * used to connect to the DB:
   * PGHOST=your database host
   * PGUSER=your database user
   * PGPASSWORD=your database password
   * PGDATABASE=your database name
   * PGPORT=your database port
   *
   * @param {object} config - The configuration settings for the instance.
   * @param {string} config.schemaName - The name of the schema (optional). Defaults to PGVECTOR_SCHEMA.
   * @param {string} config.tableName - The name of the table (optional). Defaults to PGVECTOR_TABLE.
   * @param {string} config.connectionString - The connection string (optional).
   * @param {number} config.dimensions - The dimensions of the embedding model.
   */
  constructor(config?: {
    schemaName?: string;
    tableName?: string;
    connectionString?: string;
    dimensions?: number;
  }) {
    this.schemaName = config?.schemaName ?? PGVECTOR_SCHEMA;
    this.tableName = config?.tableName ?? PGVECTOR_TABLE;
    this.connectionString = config?.connectionString;
    this.dimensions = config?.dimensions ?? 1536;
  }

  /**
   * Setter for the collection property.
   * Using a collection allows for simple segregation of vector data,
   * e.g. by user, source, or access-level.
   * Leave/set blank to ignore the collection value when querying.
   * @param coll Name for the collection.
   */
  setCollection(coll: string) {
    this.collection = coll;
  }

  /**
   * Getter for the collection property.
   * Using a collection allows for simple segregation of vector data,
   * e.g. by user, source, or access-level.
   * Leave/set blank to ignore the collection value when querying.
   * @returns The currently-set collection value.  Default is empty string.
   */
  getCollection(): string {
    return this.collection;
  }

  private async getDb(): Promise<pg.Client> {
    if (!this.db) {
      try {
        // Create DB connection
        // Read connection params from env - see comment block above
        const db = new pg.Client({
          connectionString: this.connectionString,
        });
        await db.connect();

        // Check vector extension
        db.query("CREATE EXTENSION IF NOT EXISTS vector");
        await pgvector.registerType(db);

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

  private async checkSchema(db: pg.Client) {
    await db.query(`CREATE SCHEMA IF NOT EXISTS ${this.schemaName}`);

    const tbl = `CREATE TABLE IF NOT EXISTS ${this.schemaName}.${this.tableName}(
                                                                                  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      external_id VARCHAR,
      collection VARCHAR,
      document TEXT,
      metadata JSONB DEFAULT '{}',
      embeddings VECTOR(${this.dimensions})
      )`;
    await db.query(tbl);

    const idxs = `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_external_id ON ${this.schemaName}.${this.tableName} (external_id);
    CREATE INDEX IF NOT EXISTS idx_${this.tableName}_collection ON ${this.schemaName}.${this.tableName} (collection);`;
    await db.query(idxs);

    // TODO add IVFFlat or HNSW indexing?
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
   * Delete all vector records for the specified collection.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @returns The result of the delete query.
   */
  async clearCollection() {
    const sql: string = `DELETE FROM ${this.schemaName}.${this.tableName}
                         WHERE collection = $1`;

    const db = (await this.getDb()) as pg.Client;
    const ret = await db.query(sql, [this.collection]);

    return ret;
  }

  private getDataToInsert(embeddingResults: BaseNode<Metadata>[]) {
    const result = [];
    for (let index = 0; index < embeddingResults.length; index++) {
      const row = embeddingResults[index];

      const id: any = row.id_.length ? row.id_ : null;
      const meta = row.metadata || {};
      meta.create_date = new Date();

      const params = [
        id,
        "",
        this.collection,
        row.getContent(MetadataMode.EMBED),
        meta,
        "[" + row.getEmbedding().join(",") + "]",
      ];

      result.push(params);
    }
    return result;
  }

  /**
   * Adds vector record(s) to the table.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns A list of zero or more id values for the created records.
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    if (embeddingResults.length == 0) {
      console.debug("Empty list sent to PGVectorStore::add");
      return Promise.resolve([]);
    }

    const sql: string = `INSERT INTO ${this.schemaName}.${this.tableName}
                           (id, external_id, collection, document, metadata, embeddings)
                         VALUES ($1, $2, $3, $4, $5, $6)`;

    const db = (await this.getDb()) as pg.Client;
    const data = this.getDataToInsert(embeddingResults);

    const ret: string[] = [];
    for (let index = 0; index < data.length; index++) {
      const params = data[index];
      try {
        const result = await db.query(sql, params);
        if (result.rows.length) {
          const id = result.rows[0].id as string;
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
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param refDocId Unique identifier for the record to delete.
   * @param deleteKwargs Required by VectorStore interface.  Currently ignored.
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string, deleteKwargs?: any): Promise<void> {
    const collectionCriteria = this.collection.length
      ? "AND collection = $2"
      : "";
    const sql: string = `DELETE FROM ${this.schemaName}.${this.tableName}
                         WHERE id = $1 ${collectionCriteria}`;

    const db = (await this.getDb()) as pg.Client;
    const params = this.collection.length
      ? [refDocId, this.collection]
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
    // TODO QUERY TYPES:
    //    Distance:       SELECT embedding <-> $1 AS distance FROM items;
    //    Inner Product:  SELECT (embedding <#> $1) * -1 AS inner_product FROM items;
    //    Cosine Sim:     SELECT 1 - (embedding <=> $1) AS cosine_similarity FROM items;

    const embedding = "[" + query.queryEmbedding?.join(",") + "]";
    const max = query.similarityTopK ?? 2;
    const whereClauses = this.collection.length ? ["collection = $2"] : [];

    const params: Array<string | number> = this.collection.length
      ? [embedding, this.collection]
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
        embeddings <-> $1 s 
      FROM ${this.schemaName}.${this.tableName} v
      ${where}
      ORDER BY s 
      LIMIT ${max}
    `;

    const db = (await this.getDb()) as pg.Client;
    const results = await db.query(sql, params);

    const nodes = results.rows.map((row) => {
      return new Document({
        id_: row.id,
        text: row.document,
        metadata: row.metadata,
        embedding: row.embeddings,
      });
    });

    const ret = {
      nodes: nodes,
      similarities: results.rows.map((row) => row.s),
      ids: results.rows.map((row) => row.id),
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
}
