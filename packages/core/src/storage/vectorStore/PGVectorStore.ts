import pg from "pg";
import pgvector from "pgvector/pg";

import { VectorStore, VectorStoreQuery, VectorStoreQueryResult } from "./types";

import { BaseNode, Document, Metadata, MetadataMode } from "../../Node";
import { GenericFileSystem } from "../FileSystem";

export const PGVECTOR_SCHEMA = "public";
export const PGVECTOR_TABLE = "llamaindex_embedding";

/**
 * Provides support for writing and querying vector data in Postgres.
 */
export class PGVectorStore implements VectorStore {
  storesText: boolean = true;

  private collection: string = "";

  /*
    FROM pg LIBRARY:
    type Config = {
      user?: string, // default process.env.PGUSER || process.env.USER
      password?: string or function, //default process.env.PGPASSWORD
      host?: string, // default process.env.PGHOST
      database?: string, // default process.env.PGDATABASE || user
      port?: number, // default process.env.PGPORT
      connectionString?: string, // e.g. postgres://user:password@host:5432/database
      ssl?: any, // passed directly to node.TLSSocket, supports all tls.connect options
      types?: any, // custom type parsers
      statement_timeout?: number, // number of milliseconds before a statement in query will time out, default is no timeout
      query_timeout?: number, // number of milliseconds before a query call will timeout, default is no timeout
      application_name?: string, // The name of the application that created this Client instance
      connectionTimeoutMillis?: number, // number of milliseconds to wait for connection, default is no timeout
      idle_in_transaction_session_timeout?: number // number of milliseconds before terminating any session with an open idle transaction, default is no timeout
    }  
  */
  db?: pg.Client;

  constructor() {}

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
        const db = new pg.Client();
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
    await db.query(`CREATE SCHEMA IF NOT EXISTS ${PGVECTOR_SCHEMA}`);

    const tbl = `CREATE TABLE IF NOT EXISTS ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE}(
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      external_id VARCHAR,
      collection VARCHAR,
      document TEXT,
      metadata JSONB DEFAULT '{}',
      embeddings VECTOR(1536)
    )`;
    await db.query(tbl);

    const idxs = `CREATE INDEX IF NOT EXISTS idx_${PGVECTOR_TABLE}_external_id ON ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} (external_id);
      CREATE INDEX IF NOT EXISTS idx_${PGVECTOR_TABLE}_collection ON ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} (collection);`;
    await db.query(idxs);

    // TODO add IVFFlat or HNSW indexing?
    return db;
  }

  // isEmbeddingQuery?: boolean | undefined;

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
    const sql: string = `DELETE FROM ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} 
      WHERE collection = $1`;

    const db = (await this.getDb()) as pg.Client;
    const ret = await db.query(sql, [this.collection]);

    return ret;
  }

  /**
   * Adds vector record(s) to the table.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns A list of zero or more id values for the created records.
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    const sql: string = `INSERT INTO ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} 
      (id, external_id, collection, document, metadata, embeddings) 
      VALUES ($1, $2, $3, $4, $5, $6)`;

    const db = (await this.getDb()) as pg.Client;

    let ret: string[] = [];
    for (let index = 0; index < embeddingResults.length; index++) {
      const row = embeddingResults[index];

      let id: any = row.id_.length ? row.id_ : null;
      let meta = row.metadata || {};
      meta.create_date = new Date();

      const params = [
        id,
        "",
        this.collection,
        row.getContent(MetadataMode.EMBED),
        meta,
        "[" + row.getEmbedding().join(",") + "]",
      ];

      try {
        const result = await db.query(sql, params);

        if (result.rows.length) {
          id = result.rows[0].id as string;
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
    const sql: string = `DELETE FROM ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} 
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
    const where = this.collection.length ? "WHERE collection = $2" : "";
    // TODO Add collection filter if set
    const sql = `SELECT * FROM ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE}
      ${where}
      ORDER BY embeddings <-> $1 LIMIT ${max}
    `;

    const db = (await this.getDb()) as pg.Client;
    const params = this.collection.length
      ? [embedding, this.collection]
      : [embedding];
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
      similarities: results.rows.map((row) => row.embeddings),
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
