import pg from 'pg';
import pgvector from 'pgvector/pg';

import {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "./types";

import { BaseNode, Document, Metadata, MetadataMode } from '../../Node';
import { GenericFileSystem } from '../FileSystem';

export const PGVECTOR_SCHEMA = 'public';
export const PGVECTOR_TABLE = 'llamaindex_embedding';

export class PGVectorStore implements VectorStore {
  storesText: boolean = true;

  private collection: string = '';

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

  setCollection(coll: string) {
    this.collection = coll;
  }

  getCollection(): string {
    return this.collection;
  }

  async getDb(): Promise<pg.Client> {
    if (! this.db) {

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

  async checkSchema(db: pg.Client) {
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

  client() {
    return this.getDb();
  }
  async clearCollection() {
    const sql: string = `DELETE FROM ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} 
      WHERE collection = $1`;

    const db = await this.getDb() as pg.Client;
    const ret = await db.query(sql, [this.collection]);

    return ret;
  }

  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {

    const sql: string = `INSERT INTO ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} 
      (id, external_id, collection, document, metadata, embeddings) 
      VALUES ($1, $2, $3, $4, $5, $6)`;

    const db = await this.getDb() as pg.Client;

    let ret: string[] = [];
    for (let index = 0; index < embeddingResults.length; index++) {
      const row = embeddingResults[index];

      let id: any = row.id_.length? row.id_: null;
      let meta = row.metadata || {};
      meta.create_date = new Date();

      const params = [
        id,
        '', 
        this.collection,
        row.getContent(MetadataMode.EMBED),
        meta, 
        '[' + row.getEmbedding().join(',') + ']'
      ];

      try {
        const result = await db.query(sql, params);

        if (result.rows.length) {
          id = result.rows[0].id as string;
          ret.push(id);
        }
      } catch (err) {
        const msg = `${ err }`;
        console.log(msg, err);
      }
    }

    return Promise.resolve(ret);
  }

  async delete(refDocId: string, deleteKwargs?: any): Promise<void> {
    const sql: string = `DELETE FROM ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE} 
      WHERE id = $1`;

    const db = await this.getDb() as pg.Client;
    await db.query(sql, [refDocId]);
    return Promise.resolve();
  }

  async query(query: VectorStoreQuery, options?: any): Promise<VectorStoreQueryResult> {
    // TODO QUERY TYPES:
    //    Distance:       SELECT embedding <-> $1 AS distance FROM items;
    //    Inner Product:  SELECT (embedding <#> $1) * -1 AS inner_product FROM items;
    //    Cosine Sim:     SELECT 1 - (embedding <=> $1) AS cosine_similarity FROM items;

    const embedding = '[' + query.queryEmbedding?.join(',') + ']';
    const max = query.similarityTopK ?? 2;
    // TODO Add collection filter if set
    const sql = `SELECT * FROM ${PGVECTOR_SCHEMA}.${PGVECTOR_TABLE}
      ORDER BY embeddings <-> $1 LIMIT ${ max }
    `;

    const db = await this.getDb() as pg.Client;
    const results = await db.query(sql, [embedding]);

    const nodes = results.rows.map(
      (row) => {
        return new Document({
          id_: row.id,
          text: row.document,
          metadata: row.metadata,
          embedding: row.embeddings
        })
      }
    );

    const ret = {
      nodes: nodes,
      similarities: results.rows.map(
        (row) => row.embeddings
      ),
      ids: results.rows.map(
        (row) => row.id
      )
    };

    return Promise.resolve(ret);
  }
  persist(persistPath: string, fs?: GenericFileSystem | undefined): Promise<void> {
    return Promise.resolve();
  }
}