import { DEFAULT_COLLECTION } from "@llamaindex/core/global";
import type pg from "pg";
import { BaseKVStore } from "./types.js";

export type DataType = Record<string, Record<string, any>>;

const DEFAULT_SCHEMA_NAME = "public";
const DEFAULT_TABLE_NAME = "llamaindex_kv_store";

export class PostgresKVStore extends BaseKVStore {
  private schemaName: string;
  private tableName: string;
  private connectionString: string | undefined = undefined;
  private db?: pg.Client;

  constructor(config?: {
    schemaName?: string | undefined;
    tableName?: string | undefined;
    connectionString?: string | undefined;
  }) {
    super();
    this.schemaName = config?.schemaName || DEFAULT_SCHEMA_NAME;
    this.tableName = config?.tableName || DEFAULT_TABLE_NAME;
    this.connectionString = config?.connectionString;
  }

  private async getDb(): Promise<pg.Client> {
    if (!this.db) {
      try {
        const pg = await import("pg");
        const { Client } = pg.default ? pg.default : pg;
        const db = new Client({ connectionString: this.connectionString });
        await db.connect();
        await this.checkSchema(db);
        this.db = db;
      } catch (err) {
        console.error(err);
        return Promise.reject(err instanceof Error ? err : new Error(`${err}`));
      }
    }
    return Promise.resolve(this.db);
  }

  private async checkSchema(db: pg.Client) {
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
    val: any,
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

  async get(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<any> {
    const db = await this.getDb();
    try {
      await db.query("BEGIN");
      const sql = `SELECT * FROM ${this.schemaName}.${this.tableName} WHERE key = $1 AND collection = $2`;
      const result = await db.query(sql, [key, collection]);
      await db.query("COMMIT");
      return result.rows[0].value;
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
