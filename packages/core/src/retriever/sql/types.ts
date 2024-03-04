import type { BaseRetriever } from "../../Retriever.js";
import {
  TextNode,
  type CallbackManager,
  type Event,
  type NodeWithScore,
  type SQLDatabase,
  type ServiceContext,
} from "../../index.js";
import type { QueryBundle } from "../../types.js";

export interface SQLTableSchema {
  tableName: string;
  contextStr: string;
}

export enum SQLParserMode {
  DEFAULT = "default",
  PGVECTOR = "pgvector",
}

// export type SQLParserMode = "default" | "pgvector";

export interface BaseSQLParser {
  parseResponseToSQL(response: string, queryBundle: QueryBundle): string;
}

export class DefaultSQLParser implements BaseSQLParser {
  parseResponseToSQL(response: string, queryBundle: QueryBundle): string {
    const sqlQueryStart = response.indexOf("SQLQuery:");
    if (sqlQueryStart !== -1) {
      response = response.slice(sqlQueryStart);
      if (response.startsWith("SQLQuery:")) {
        response = response.slice("SQLQuery:".length);
      }
    }
    const sqlResultStart = response.indexOf("SQLResult:");
    if (sqlResultStart !== -1) {
      response = response.slice(0, sqlResultStart);
    }
    return response.trim().replace("```", "").trim();
  }
}

export class SQLRetriever implements BaseRetriever {
  sqlDatabase: SQLDatabase;
  returnRaw: boolean;

  constructor(
    sqlDatabase: SQLDatabase,
    returnRaw: boolean = true,
    callbackManager: CallbackManager | null = null,
    kwargs: any = {},
  ) {
    this.sqlDatabase = sqlDatabase;
    this.returnRaw = returnRaw;
  }

  getServiceContext(): ServiceContext {
    throw new Error("Method not implemented.");
  }

  _formatNodeResults(results: any[][], colKeys: string[]): NodeWithScore[] {
    const nodes: NodeWithScore[] = [];
    for (const result of results) {
      const metadata = Object.fromEntries(
        colKeys.map((key, i) => [key, result[i]]),
      );
      const textNode = new TextNode({
        text: "",
        metadata,
      });
      nodes.push({ node: textNode });
    }
    return nodes;
  }

  async retrieveWithMetadata(
    strOrQueryBundle: QueryBundle,
  ): Promise<[NodeWithScore[], any]> {
    const [rawResponseStr, metadata] = await this.sqlDatabase.runSQL(
      strOrQueryBundle.queryStr,
    );

    if (this.returnRaw) {
      return [[{ node: new TextNode({ text: rawResponseStr }) }], metadata];
    } else {
      const results = metadata.result;
      const colKeys = metadata.colKeys;
      return [this._formatNodeResults(results, colKeys), metadata];
    }
  }

  async retrieve(
    query: string,
    parentEvent: Event | undefined,
    preFilters: unknown,
  ): Promise<NodeWithScore[]> {
    const retrievedNodes = await this.retrieveWithMetadata({
      queryStr: query,
    });

    return retrievedNodes;
  }
}
