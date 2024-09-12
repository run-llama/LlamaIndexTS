import { DEFAULT_NAMESPACE } from "@llamaindex/core/global";
import { PostgresKVStore } from "../kvStore/PostgresKVStore.js";
import { KVIndexStore } from "./KVIndexStore.js";

const DEFAULT_TABLE_NAME = "llamaindex_index_store";

export class PostgresIndexStore extends KVIndexStore {
  constructor(config?: {
    schemaName?: string;
    tableName?: string;
    connectionString?: string;
    namespace?: string;
  }) {
    const kvStore = new PostgresKVStore({
      schemaName: config?.schemaName,
      tableName: config?.tableName || DEFAULT_TABLE_NAME,
    });
    const namespace = config?.namespace || DEFAULT_NAMESPACE;
    super(kvStore, namespace);
  }
}
