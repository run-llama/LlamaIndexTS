import type pg from "pg";

import {
  FilterCondition,
  FilterOperator,
  type MetadataFilter,
  type MetadataFilterValue,
  VectorStoreBase,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";

import { escapeLikeString } from "./utils.js";

import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import type { BaseNode, Metadata } from "@llamaindex/core/schema";
import { Document, MetadataMode } from "@llamaindex/core/schema";

export const PGVECTOR_SCHEMA = "public";
export const PGVECTOR_TABLE = "llamaindex_embedding";

export type PGVectorStoreConfig = {
  schemaName?: string | undefined;
  tableName?: string | undefined;
  database?: string | undefined;
  connectionString?: string | undefined;
  dimensions?: number | undefined;
  embedModel?: BaseEmbedding | undefined;
};

/**
 * Provides support for writing and querying vector data in Postgres.
 * Note: Can't be used with data created using the Python version of the vector store (https://docs.llamaindex.ai/en/stable/examples/vector_stores/postgres.html)
 */
export class PGVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  storesText: boolean = true;

  private collection: string = "";
  private schemaName: string = PGVECTOR_SCHEMA;
  private tableName: string = PGVECTOR_TABLE;

  private database: string | undefined = undefined;
  private connectionString: string | undefined = undefined;
  private dimensions: number = 1536;

  private db?: pg.ClientBase;

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
   */
  constructor(configOrClient?: PGVectorStoreConfig | pg.ClientBase) {
    // We cannot import pg from top level, it might have side effects
    //  so we only check if the config.connect function exists
    if (
      configOrClient &&
      "connect" in configOrClient &&
      typeof configOrClient.connect === "function"
    ) {
      const db = configOrClient as pg.ClientBase;
      super();
      this.db = db;
    } else {
      const config = configOrClient as PGVectorStoreConfig;
      super(config?.embedModel);
      this.schemaName = config?.schemaName ?? PGVECTOR_SCHEMA;
      this.tableName = config?.tableName ?? PGVECTOR_TABLE;
      this.database = config?.database;
      this.connectionString = config?.connectionString;
      this.dimensions = config?.dimensions ?? 1536;
    }
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

  private async getDb(): Promise<pg.ClientBase> {
    if (!this.db) {
      try {
        const pg = await import("pg");
        const { Client } = pg.default ? pg.default : pg;

        const { registerType } = await import("pgvector/pg");
        // Create DB connection
        // Read connection params from env - see comment block above
        const db = new Client({
          database: this.database,
          connectionString: this.connectionString,
        });
        await db.connect();

        // Check vector extension
        await db.query("CREATE EXTENSION IF NOT EXISTS vector");
        await registerType(db);

        // All good?  Keep the connection reference
        this.db = db;
      } catch (err) {
        console.error(err);
        return Promise.reject(err instanceof Error ? err : new Error(`${err}`));
      }
    }

    const db = this.db;

    // Check schema, table(s), index(es)
    await this.checkSchema(db);

    return Promise.resolve(this.db);
  }

  private async checkSchema(db: pg.ClientBase) {
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

    const db = await this.getDb();
    const ret = await db.query(sql, [this.collection]);

    return ret;
  }

  private getDataToInsert(embeddingResults: BaseNode<Metadata>[]) {
    return embeddingResults.map((node) => {
      const id: any = node.id_.length ? node.id_ : null;
      const meta = node.metadata || {};
      if (!meta.create_date) {
        meta.create_date = new Date();
      }

      return [
        id,
        "",
        this.collection,
        node.getContent(MetadataMode.NONE),
        meta,
        "[" + node.getEmbedding().join(",") + "]",
      ];
    });
  }

  /**
   * Adds vector record(s) to the table.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns A list of zero or more id values for the created records.
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    if (embeddingResults.length === 0) {
      console.warn("Empty list sent to PGVectorStore::add");
      return [];
    }

    const db = await this.getDb();

    try {
      await db.query("BEGIN");

      const data = this.getDataToInsert(embeddingResults);

      const placeholders = data
        .map(
          (_, index) =>
            `($${index * 6 + 1}, ` +
            `$${index * 6 + 2}, ` +
            `$${index * 6 + 3}, ` +
            `$${index * 6 + 4}, ` +
            `$${index * 6 + 5}, ` +
            `$${index * 6 + 6})`,
        )
        .join(", ");

      const sql = `
        INSERT INTO ${this.schemaName}.${this.tableName}
          (id, external_id, collection, document, metadata, embeddings)
        VALUES ${placeholders}
        ON CONFLICT (id) DO UPDATE SET
          external_id = EXCLUDED.external_id,
          collection = EXCLUDED.collection,
          document = EXCLUDED.document,
          metadata = EXCLUDED.metadata,
          embeddings = EXCLUDED.embeddings
        RETURNING id
      `;

      const flattenedParams = data.flat();
      const result = await db.query(sql, flattenedParams);

      await db.query("COMMIT");

      return result.rows.map((row) => row.id as string);
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
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
    const collectionCriteria = this.collection.length
      ? "AND collection = $2"
      : "";
    const sql: string = `DELETE FROM ${this.schemaName}.${this.tableName}
                         WHERE id = $1 ${collectionCriteria}`;

    const db = await this.getDb();
    const params = this.collection.length
      ? [refDocId, this.collection]
      : [refDocId];
    await db.query(sql, params);
    return Promise.resolve();
  }

  private toPostgresCondition(condition: `${FilterCondition}`) {
    if (condition === FilterCondition.AND) {
      return "AND";
    }
    if (condition === FilterCondition.OR) {
      return "OR";
    }
    // fallback to AND
    else {
      return "AND";
    }
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

  private buildFilterClause(
    filter: MetadataFilter,
    paramIndex: number,
  ): {
    clause: string;
    param: string | string[] | number | number[] | undefined;
  } {
    if (
      filter.operator === FilterOperator.IN ||
      filter.operator === FilterOperator.NIN
    ) {
      return {
        clause: `metadata->>'${filter.key}' ${this.toPostgresOperator(filter.operator)}($${paramIndex})`,
        param: filter.value,
      };
    }

    if (
      filter.operator === FilterOperator.ALL ||
      filter.operator === FilterOperator.ANY
    ) {
      return {
        clause: `metadata->'${filter.key}' ${this.toPostgresOperator(filter.operator)} $${paramIndex}::text[]`,
        param: filter.value,
      };
    }

    if (filter.operator === FilterOperator.CONTAINS) {
      return {
        clause: `metadata->'${filter.key}' ${this.toPostgresOperator(filter.operator)} $${paramIndex}::jsonb`,
        param: JSON.stringify([filter.value]),
      };
    }

    if (filter.operator === FilterOperator.IS_EMPTY) {
      return {
        clause: `(NOT (metadata ? '${filter.key}') OR metadata->>'${filter.key}' IS NULL OR metadata->>'${filter.key}' = '' OR metadata->'${filter.key}' = '[]'::jsonb)`,
        param: undefined,
      };
    }

    if (filter.operator === FilterOperator.TEXT_MATCH) {
      const escapedValue = escapeLikeString(filter.value as string);
      return {
        clause: `metadata->>'${filter.key}' LIKE $${paramIndex}`,
        param: `%${escapedValue}%`,
      };
    }

    // if value is number, coerce metadata value to float
    if (typeof filter.value === "number") {
      return {
        clause: `(metadata->>'${filter.key}')::float ${this.toPostgresOperator(filter.operator)} $${paramIndex}`,
        param: filter.value,
      };
    }

    return {
      clause: `metadata->>'${filter.key}' ${this.toPostgresOperator(filter.operator)} $${paramIndex}`,
      param: filter.value,
    };
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
    //    Distance:       SELECT embedding <=> $1 AS distance FROM items;
    //    Inner Product:  SELECT (embedding <#> $1) * -1 AS inner_product FROM items;
    //    Cosine Sim:     SELECT 1 - (embedding <=> $1) AS cosine_similarity FROM items;

    const embedding = "[" + query.queryEmbedding?.join(",") + "]";
    const max = query.similarityTopK ?? 2;
    const whereClauses = this.collection.length ? ["collection = $2"] : [];

    const params: Array<MetadataFilterValue> = this.collection.length
      ? [embedding, this.collection]
      : [embedding];

    const filterClauses: string[] = [];
    query.filters?.filters.forEach((filter, index) => {
      const paramIndex = params.length + 1;
      const { clause, param } = this.buildFilterClause(filter, paramIndex);
      filterClauses.push(clause);
      if (param) {
        params.push(param);
      }
    });

    if (filterClauses.length > 0) {
      const condition = this.toPostgresCondition(
        query.filters?.condition ?? FilterCondition.AND,
      );
      whereClauses.push(`(${filterClauses.join(` ${condition} `)})`);
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `SELECT 
        v.*, 
        embeddings <=> $1 s 
      FROM ${this.schemaName}.${this.tableName} v
      ${where}
      ORDER BY s 
      LIMIT ${max}
    `;

    const db = await this.getDb();
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
      similarities: results.rows.map((row) => 1 - row.s),
      ids: results.rows.map((row) => row.id),
    };

    return Promise.resolve(ret);
  }

  /**
   * Required by VectorStore interface.  Currently ignored.
   * @param persistPath
   * @returns Resolved Promise.
   */
  persist(persistPath: string): Promise<void> {
    return Promise.resolve();
  }
}
