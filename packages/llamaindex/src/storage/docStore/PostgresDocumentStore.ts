import { DEFAULT_NAMESPACE } from "@llamaindex/core/global";
import type pg from "pg";
import { PostgresKVStore } from "../kvStore/PostgresKVStore.js";
import { KVDocumentStore } from "./KVDocumentStore.js";

const DEFAULT_TABLE_NAME = "llamaindex_doc_store";

export class PostgresDocumentStore extends KVDocumentStore {
  constructor(config?: {
    schemaName?: string;
    tableName?: string;
    clientConfig?: pg.ClientConfig;
    namespace?: string;
  }) {
    const kvStore = new PostgresKVStore({
      schemaName: config?.schemaName,
      tableName: config?.tableName || DEFAULT_TABLE_NAME,
      clientConfig: config?.clientConfig,
    });
    const namespace = config?.namespace || DEFAULT_NAMESPACE;
    super(kvStore, namespace);
  }
}
