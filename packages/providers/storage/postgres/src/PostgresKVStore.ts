import { DEFAULT_COLLECTION } from "@llamaindex/core/global";
import type { StoredValue } from "@llamaindex/core/schema";
import { BaseKVStore } from "@llamaindex/core/storage/kv-store";
import type pg from "pg";

export type DataType = Record<string, Record<string, StoredValue>>;

const DEFAULT_SCHEMA_NAME = "public";
const DEFAULT_TABLE_NAME = "llamaindex_kv_store";

export type PostgresKVStoreBaseConfig = {
  schemaName?: string | undefined;
  tableName?: string | undefined;
};

export type PostgresKVStoreClientConfig =
  | {
      /**
       * Client configuration options for the pg client.
       *
       * {@link https://node-postgres.com/apis/client#new-client PostgresSQL Client API}
       */
      clientConfig?: pg.ClientConfig | undefined;
    }
  | {
      /**
       * A pg client or pool client instance.
       * If provided, make sure it is not connected to the database yet, or it will throw an error.
       */
      shouldConnect?: boolean | undefined;
      client?: pg.Client | pg.PoolClient;
    };

export type PostgresKVStoreConfig = PostgresKVStoreBaseConfig &
  PostgresKVStoreClientConfig;

export class PostgresKVStore extends BaseKVStore {
  private schemaName: string;
  private tableName: string;

  private isDBConnected: boolean = false;
  private clientConfig: pg.ClientConfig | undefined = undefined;
  private db?: pg.ClientBase | undefined = undefined;

  constructor(config?: PostgresKVStoreConfig) {
    super();
    this.schemaName = config?.schemaName || DEFAULT_SCHEMA_NAME;
    this.tableName = config?.tableName || DEFAULT_TABLE_NAME;
    if (config) {
      if ("clientConfig" in config) {
        this.clientConfig = config.clientConfig;
      } else if ("client" in config) {
        this.isDBConnected =
          config?.shouldConnect !== undefined ? !config.shouldConnect : false;
        this.db = config.client;
      }
    }
  }

  private async getDb(): Promise<pg.ClientBase> {
    if (!this.db) {
      const pg = await import("pg");
      const { Client } = pg.default ? pg.default : pg;
      const db = new Client({ ...this.clientConfig });
      await db.connect();
      this.isDBConnected = true;
      this.db = db;
    }
    if (this.db && !this.isDBConnected) {
      await this.db.connect();
      this.isDBConnected = true;
    }
    this.db.on("end", () => {
      this.isDBConnected = false;
    });
    await this.checkSchema(this.db);
    return this.db;
  }

  private async checkSchema(db: pg.ClientBase) {
    await db.query(`CREATE SCHEMA IF NOT EXISTS ${this.schemaName}`);
    const tbl = `CREATE TABLE IF NOT EXISTS ${this.schemaName}.${this.tableName} (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      collection VARCHAR,
      key VARCHAR,
      value JSONB DEFAULT '{}'
    )`;
    await db.query(tbl);
    const idxs = `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_collection ON ${this.schemaName}.${this.tableName} (collection);
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_key ON ${this.schemaName}.${this.tableName} (key);`;
    await db.query(idxs);
    return db;
  }

  client() {
    return this.getDb();
  }

  async put(
    key: string,
    val: StoredValue,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<void> {
    const db = await this.getDb();
    try {
      await db.query("BEGIN");
      const sql = `
        INSERT INTO ${this.schemaName}.${this.tableName}
          (collection, key, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
          collection = EXCLUDED.collection,
          key = EXCLUDED.key,
          value = EXCLUDED.value
        RETURNING id
      `;
      const values = [collection, key, val];
      await db.query(sql, values);
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }

  async get(key: string, collection: string = DEFAULT_COLLECTION) {
    const db = await this.getDb();
    try {
      await db.query("BEGIN");
      const sql = `SELECT * FROM ${this.schemaName}.${this.tableName} WHERE key = $1 AND collection = $2`;
      const result = await db.query(sql, [key, collection]);
      await db.query("COMMIT");
      return result.rows[0]?.value;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }

  async getAll(collection: string = DEFAULT_COLLECTION): Promise<DataType> {
    const db = await this.getDb();
    try {
      await db.query("BEGIN");
      const sql = `SELECT * FROM ${this.schemaName}.${this.tableName} WHERE collection = $1`;
      const result = await db.query(sql, [collection]);
      await db.query("COMMIT");
      return result.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }

  async delete(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<boolean> {
    const db = await this.getDb();
    try {
      await db.query("BEGIN");
      const sql = `DELETE FROM ${this.schemaName}.${this.tableName} WHERE key = $1 AND collection = $2`;
      const result = await db.query(sql, [key, collection]);
      await db.query("COMMIT");
      return !!result.rowCount && result.rowCount > 0;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }
}
