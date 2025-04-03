import { type BaseReader, Document } from "@llamaindex/core/schema";
import pg from "pg";

export type PostgresReaderConfig = {
  /**
   * The query to execute. Must return at least one column.
   */
  query: string;
  /**
   * An array of field names to retrieve from each row. Defaults to first column.
   */
  fields?: string[];
  /**
   * The separator to join multiple field values. Defaults to an empty string.
   */
  fieldSeparator?: string;
  /**
   * An optional array of metadata field names to extract as metadata.
   */
  metadataFields?: string[];
};

export type PostgresReaderClientConfig =
  | {
      clientConfig?: pg.ClientConfig | undefined;
    }
  | {
      shouldConnect?: boolean | undefined;
      client?: pg.Client | pg.PoolClient;
    };

export class PostgresReader implements BaseReader<Document> {
  private isDBConnected: boolean = false;
  private clientConfig: pg.ClientConfig | undefined = undefined;
  private db: pg.ClientBase | undefined = undefined;

  constructor(config: PostgresReaderClientConfig) {
    if (this.hasClientConfig(config)) {
      this.clientConfig = config.clientConfig;
    } else if (this.hasClient(config)) {
      this.isDBConnected =
        config?.shouldConnect !== undefined ? !config.shouldConnect : false;
      this.db = config.client;
    }
  }

  private hasClientConfig(
    config: PostgresReaderClientConfig,
  ): config is { clientConfig: pg.ClientConfig } {
    return "clientConfig" in config;
  }

  private hasClient(
    config: PostgresReaderClientConfig,
  ): config is { client: pg.Client | pg.PoolClient; shouldConnect?: boolean } {
    return "client" in config;
  }

  private async importPg() {
    const pg = await import("pg");
    return pg;
  }

  private async initializeConnection(): Promise<pg.ClientBase> {
    const pg = await this.importPg();
    const { Client } = pg.default ? pg.default : pg;
    const client = new Client({ ...this.clientConfig });
    await client.connect();
    return client;
  }

  private checkDBIsNotConnected(): boolean {
    return this.db !== null && this.isDBConnected === false;
  }

  private async getDb(): Promise<pg.ClientBase> {
    if (!this.db) {
      this.db = await this.initializeConnection();
      this.isDBConnected = true;
    }
    if (this.checkDBIsNotConnected()) {
      await this.db.connect();
      this.isDBConnected = true;
    }
    this.db.on("end", () => {
      this.isDBConnected = false;
    });

    return this.db;
  }

  async loadData(config: PostgresReaderConfig): Promise<Document[]> {
    const db = await this.getDb();
    try {
      const result = await db.query(config.query);
      return this.processResult(result, config);
    } catch (err) {
      throw new Error(`Error executing query: ${(err as Error).message}`);
    }
  }

  private processResult(
    result: pg.QueryResult,
    config: PostgresReaderConfig,
  ): Document[] {
    const documents: Document[] = [];
    for (const row of result.rows) {
      const text = this.extractText(row, config);
      const metadata = this.extractMetadata(row, config);

      documents.push(new Document({ text, metadata }));
    }
    return documents;
  }

  private extractFieldsFromRow(
    row: Record<string, unknown>,
    config: PostgresReaderConfig,
  ): (string | undefined)[] {
    const fields = config.fields || [Object.keys(row)[0]];
    return fields;
  }

  private extractText(
    row: Record<string, unknown>,
    config: PostgresReaderConfig,
  ): string {
    const fields = this.extractFieldsFromRow(row, config);
    const texts = fields
      .filter((f): f is string => typeof f === "string")
      .map((name) => String(row[name] ?? ""));
    return texts.join(config.fieldSeparator || "");
  }

  private extractMetadata(
    row: Record<string, unknown>,
    config: PostgresReaderConfig,
  ): Record<string, unknown> {
    let metadata = {};
    if (config.metadataFields) {
      metadata = Object.fromEntries(
        config.metadataFields.map((name) => [name, row[name]]),
      );
    }
    return metadata;
  }
}
