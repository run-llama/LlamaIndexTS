import type pg from "pg";

import type { IsomorphicDB } from "@llamaindex/core/vector-store";
import type { VercelPool } from "@vercel/postgres";
import type { Sql } from "postgres";
import {
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  type MetadataFilter,
  type MetadataFilterValue,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";

import { escapeLikeString } from "./utils.js";

import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import { DEFAULT_COLLECTION } from "@llamaindex/core/global";
import type { BaseNode, Metadata } from "@llamaindex/core/schema";
import { Document, MetadataMode } from "@llamaindex/core/schema";

// todo: create adapter for postgres client
function fromVercelPool(client: VercelPool): IsomorphicDB {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryFn = async (sql: string, params?: any[]): Promise<any[]> => {
    return client.query(sql, params).then((result) => result.rows);
  };
  return {
    query: queryFn,
    begin: async (fn) => {
      await client.query("BEGIN");
      try {
        const result = await fn(queryFn);
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    },
    connect: async () => {
      await client.connect();
    },
    close: async () => client.end(),
    onCloseEvent: (fn) => {
      client.on("remove", () => {
        fn();
      });
    },
  };
}

function fromPostgres(client: Sql): IsomorphicDB {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: async (sql: string, params?: any[]): Promise<any[]> => {
      return client.unsafe(sql, params);
    },
    begin: async (fn) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let res: any;
      await client.begin(async (scopedClient) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryFn = async (sql: string, params?: any[]): Promise<any[]> => {
          return scopedClient.unsafe(sql, params);
        };
        res = await fn(queryFn);
      });
      return res;
    },
    connect: () => Promise.resolve(),
    close: async () => client.end(),
    onCloseEvent: () => {
      // no close event
    },
  };
}

function fromPG(client: pg.Client | pg.PoolClient): IsomorphicDB {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryFn = async (sql: string, params?: any[]): Promise<any[]> => {
    return (await client.query(sql, params)).rows;
  };
  return {
    query: queryFn,
    begin: async (fn) => {
      await client.query("BEGIN");
      try {
        const result = await fn(queryFn);
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    },
    connect: () => client.connect(),
    close: async () => {
      if ("end" in client) {
        await client.end();
      } else if ("release" in client) {
        client.release();
      }
    },
    onCloseEvent: (fn) => {
      client.on("end", fn);
    },
  };
}

export const PGVECTOR_SCHEMA = "public";
export const PGVECTOR_TABLE = "llamaindex_embedding";
export const DEFAULT_DIMENSIONS = 1536;

type PGVectorStoreBaseConfig = {
  schemaName?: string | undefined;
  tableName?: string | undefined;
  dimensions?: number | undefined;
  embedModel?: BaseEmbedding | undefined;
  performSetup?: boolean | undefined;
};

export type PGVectorStoreConfig = VectorStoreBaseParams &
  PGVectorStoreBaseConfig &
  (
    | {
        /**
         * Client configuration options for the pg client.
         *
         * {@link https://node-postgres.com/apis/client#new-client PostgresSQL Client API}
         */
        clientConfig: pg.ClientConfig;
      }
    | {
        /**
         * A pg client or pool client instance.
         * If provided, make sure it is not connected to the database yet, or it will throw an error.
         */
        shouldConnect?: boolean | undefined;
        client: pg.Client | pg.PoolClient;
      }
    | {
        /**
         * No need to connect to the database, the client is already connected.
         */
        shouldConnect?: false;
        client: Sql | VercelPool;
      }
  );

/**
 * Provides support for writing and querying vector data in Postgres.
 * Note: Can't be used with data created using the Python version of the vector store (https://docs.llamaindex.ai/en/stable/examples/vector_stores/postgres/)
 */
export class PGVectorStore extends BaseVectorStore {
  storesText: boolean = true;

  private collection: string = DEFAULT_COLLECTION;
  private readonly schemaName: string = PGVECTOR_SCHEMA;
  private readonly tableName: string = PGVECTOR_TABLE;
  private readonly dimensions: number = DEFAULT_DIMENSIONS;

  private isDBConnected: boolean = false;
  private db: IsomorphicDB | null = null;
  private readonly clientConfig: pg.ClientConfig | null = null;
  private readonly performSetup: boolean = true;

  constructor(config: PGVectorStoreConfig) {
    super(config);
    this.schemaName = config?.schemaName ?? PGVECTOR_SCHEMA;
    this.tableName = config?.tableName ?? PGVECTOR_TABLE;
    this.dimensions = config?.dimensions ?? DEFAULT_DIMENSIONS;
    this.performSetup = config?.performSetup ?? true;
    if ("clientConfig" in config) {
      this.clientConfig = config.clientConfig;
    } else {
      if (config.client.constructor.name.includes("Vercel")) {
        this.isDBConnected = true;
        this.db = fromVercelPool(config.client as unknown as VercelPool);
      } else if (typeof config.client === "function") {
        this.isDBConnected = true;
        this.db = fromPostgres(config.client as Sql);
      } else {
        this.isDBConnected =
          config.shouldConnect !== undefined ? !config.shouldConnect : false;
        this.db = fromPG(config.client as pg.Client | pg.PoolClient);
      }
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

  private async getDb(): Promise<IsomorphicDB> {
    if (!this.db) {
      const pg = await import("pg");
      const { Client } = pg.default ? pg.default : pg;

      const { registerTypes } = await import("pgvector/pg");
      // Create DB connection
      // Read connection params from env - see comment block above
      const db = new Client({
        ...this.clientConfig,
      });

      await db.connect();
      this.isDBConnected = true;

      // Check vector extension
      await db.query("CREATE EXTENSION IF NOT EXISTS vector");
      await registerTypes(db);

      // All good?  Keep the connection reference
      this.db = fromPG(db);
    }

    if (this.db && !this.isDBConnected) {
      await this.db.connect();
      this.isDBConnected = true;
    }

    this.db.onCloseEvent(() => {
      this.isDBConnected = false;
    });

    if (this.performSetup) {
      // Check schema, table(s), index(es)
      await this.checkSchema(this.db);
    }

    return this.db;
  }

  private async checkSchema(db: IsomorphicDB) {
    await db.query(`CREATE SCHEMA IF NOT EXISTS ${this.schemaName}`);

    await db.query(`CREATE TABLE IF NOT EXISTS ${this.schemaName}.${this.tableName}(
                                                                                  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      external_id VARCHAR,
      collection VARCHAR,
      document TEXT,
      metadata JSONB DEFAULT '{}',
      embeddings VECTOR(${this.dimensions})
      )`);
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_external_id ON ${this.schemaName}.${this.tableName} (external_id);`,
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_collection ON ${this.schemaName}.${this.tableName} (collection);`,
    );

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
      const id = node.id_.length ? node.id_ : null;
      const meta = node.metadata || {};
      if (!meta.create_date) {
        meta.create_date = new Date();
      }

      return [
        // fixme: why id is null?
        id!,
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

    return db.begin(async (query) => {
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
      const result = await query(sql, flattenedParams);
      return result.map((row) => row.id as string);
    });
  }

  /**
   * Deletes a single record from the database by id.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param refDocId Unique identifier for the record to delete.
   * @param deleteKwargs Required by VectorStore interface.  Currently ignored.
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string, deleteKwargs?: object): Promise<void> {
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
    options?: object,
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

    const nodes = results.map((row) => {
      return new Document({
        id_: row.id,
        text: row.document,
        metadata: row.metadata,
        embedding:
          typeof row.embeddings === "string"
            ? JSON.parse(row.embeddings)
            : row.embeddings,
      });
    });

    const ret = {
      nodes: nodes,
      similarities: results.map((row) => 1 - row.s),
      ids: results.map((row) => row.id),
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
