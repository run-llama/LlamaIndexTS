import {
  BaseVectorStore,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";

import { createClient, type Client, type InStatement } from "@libsql/client";
import {
  MetadataMode,
  type BaseNode,
  type Metadata,
  type TextNode,
} from "@llamaindex/core/schema";
import { getEnv } from "@llamaindex/env";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

type LibSQLParams = {
  db?: Client;
  url?: string;
  authToken?: string;
  tableName?: string;
  columnName?: string;
  batchSize?: number;
  dimensions?: number;
} & VectorStoreBaseParams;

/**
 * LibSQLVectorStore provides integration with libSQL/Turso for vector storage and similarity search.
 * Note: You must create the table and vector index before using this store.
 * See documentation for required schema and index setup.
 */
export class LibSQLVectorStore extends BaseVectorStore {
  storesText: boolean = true;

  private db: Client;
  private batchSize: number;
  private tableName: string;
  private columnName: string;
  private dimensions: number;

  /**
   * @param db Optional existing LibSQL client instance
   * @param url LibSQL database URL. If not set, uses process.env.LIBSQL_URL
   * @param authToken LibSQL auth token. If not set, uses process.env.LIBSQL_AUTH_TOKEN
   * @param tableName Name of the table storing vectors. Defaults to 'vectors'
   * @param columnName Name of the column storing embeddings. Defaults to 'embedding'
   * @param batchSize Maximum number of vectors upserted at once. Default is 100
   * @param dimensions Dimensionality of the embedding vectors. Defaults to 1536
   */
  constructor(params?: LibSQLParams) {
    super(params);
    this.tableName = params?.tableName ?? "vectors";
    this.columnName = params?.columnName ?? "embedding";
    this.batchSize = params?.batchSize ?? 100;
    this.dimensions = params?.dimensions ?? 1536;

    if (params?.db) {
      this.db = params.db;
    } else {
      const url = params?.url ?? getEnv("LIBSQL_URL");
      const authToken = params?.authToken ?? getEnv("LIBSQL_AUTH_TOKEN");

      if (!url) {
        throw new Error(
          "Must specify LIBSQL_URL via env variable or constructor parameter",
        );
      }

      this.db = createClient({ url, ...(authToken && { authToken }) });
    }
  }

  client() {
    return this.db;
  }

  async add(nodes: BaseNode<Metadata>[]): Promise<string[]> {
    if (nodes.length === 0) return [];

    const rows = nodes.map((node) => {
      const embedding = node.getEmbedding();
      if (embedding.length !== this.dimensions) {
        throw new Error(
          `Expected embedding dimension ${this.dimensions}, got ${embedding.length}`,
        );
      }

      return {
        id: node.id_,
        content: node.getContent(MetadataMode.NONE),
        embedding: `[${embedding.join(",")}]`,
        metadata: JSON.stringify(nodeToMetadata(node)),
      };
    });

    return this.upsertInBatches(rows);
  }

  async addPlainText(nodes: TextNode<Metadata>[]): Promise<string[]> {
    if (nodes.length === 0) return [];

    const rows = nodes.map((node) => {
      const embedding = node.getEmbedding();
      if (embedding.length !== this.dimensions) {
        throw new Error(
          `Expected embedding dimension ${this.dimensions}, got ${embedding.length}`,
        );
      }

      return {
        id: node.id_,
        content: node.text,
        embedding: `[${embedding.join(",")}]`,
        metadata: JSON.stringify(nodeToMetadata(node)),
      };
    });

    return this.upsertInBatches(rows);
  }

  private async upsertInBatches(
    rows: Array<{
      id: string;
      content: string;
      embedding: string;
      metadata: string;
    }>,
  ): Promise<string[]> {
    const ids: string[] = [];

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);

      const insertQueries: InStatement[] = batch.map((row) => ({
        sql: `
          INSERT OR REPLACE INTO ${this.tableName}
          (id, content, metadata, ${this.columnName})
          VALUES (:id, :content, :metadata, vector(:embedding))
          RETURNING id
        `,
        args: row,
      }));

      const results = await this.db.batch(insertQueries);

      ids.push(
        ...results.flatMap((result) =>
          result.rows.map((row) => String(row.id)),
        ),
      );
    }

    return ids;
  }

  async delete(refDocId: string): Promise<void> {
    await this.db.execute({
      sql: `DELETE FROM ${this.tableName} WHERE id = ?`,
      args: [refDocId],
    });
  }

  async deleteMany(refDocIds: string[]): Promise<void> {
    if (refDocIds.length === 0) return;

    const placeholders = refDocIds.map(() => "?").join(",");

    await this.db.execute({
      sql: `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`,
      args: refDocIds,
    });
  }

  async query(query: VectorStoreQuery): Promise<VectorStoreQueryResult> {
    console.log("Query parameters:", JSON.stringify(query, null, 2));

    if (
      !query.queryEmbedding ||
      query.queryEmbedding.length !== this.dimensions
    ) {
      console.error(`Invalid query embedding: ${query.queryEmbedding}`);
      throw new Error(`Query embedding must have dimension ${this.dimensions}`);
    }

    const queryVector = `[${query.queryEmbedding.join(",")}]`;
    const filter = this.buildWhereClause(query.filters);

    const sql: InStatement = {
      sql: `
        WITH vector_scores AS (
          SELECT
            id,
            content,
            metadata,
            ${this.columnName} as embedding,
            1 - vector_distance_cos(${this.columnName}, vector32(:queryVector)) AS similarity
          FROM ${this.tableName}
          ${filter ? `WHERE ${filter.clause}` : ""}
          ORDER BY similarity DESC
          LIMIT :k
        )
        SELECT * FROM vector_scores
      `,
      args: {
        queryVector,
        k: query.similarityTopK,
        ...filter?.args,
      },
    };

    console.log("Executing SQL:", sql.sql);
    console.log("SQL args:", JSON.stringify(sql.args, null, 2));

    const results = await this.db.execute(sql);
    console.log("Raw query results:", JSON.stringify(results.rows, null, 2));

    const nodes = results.rows.map((row) => {
      const metadata = JSON.parse(row.metadata as string);
      return metadataDictToNode(metadata, {
        fallback: {
          id: row.id as string,
          content: row.content as string,
          metadata,
          embedding: Array.from(new Float32Array(row.embedding as Buffer)),
        },
      });
    });

    const similarities = results.rows.map((row) => Number(row.similarity));
    console.log("Calculated similarities:", similarities);

    return {
      nodes,
      similarities,
      ids: results.rows.map((row) => String(row.id)),
    };
  }

  // Figure out a DX for this that works with other tables
  private buildWhereClause(filters?: MetadataFilters) {
    if (!filters?.filters.length) return null;

    const clauses: string[] = [];
    const args: Record<string, unknown> = {};

    filters.filters.forEach((filter, index) => {
      const key = `value${index}`;
      const jsonPath = `$.${filter.key}`;

      switch (filter.operator) {
        case "==":
          clauses.push(`json_extract(metadata, :path${index}) = :${key}`);
          args[`path${index}`] = jsonPath;
          args[key] = filter.value;
          break;
        case ">":
        case "<":
        case ">=":
        case "<=":
          clauses.push(
            `json_extract(metadata, :path${index}) ${filter.operator} :${key}`,
          );
          args[`path${index}`] = jsonPath;
          args[key] = filter.value;
          break;
        case "contains":
          clauses.push(`json_extract(metadata, :path${index}) LIKE :${key}`);
          args[`path${index}`] = jsonPath;
          args[key] = `%${filter.value}%`;
          break;
      }
    });

    const condition = filters.condition === "or" ? " OR " : " AND ";

    return {
      clause: clauses.join(condition),
      args,
    };
  }
}
