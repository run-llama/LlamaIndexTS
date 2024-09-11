import { DEFAULT_NAMESPACE } from "@llamaindex/core/global";
import { PostgresKVStore } from "../kvStore/PostgresKVStore.js";
import { KVDocumentStore } from "./KVDocumentStore.js";

const DEFAULT_TABLE_NAME = "llamaindex_doc_store";

export class PostgresDocumentStore extends KVDocumentStore {
  constructor(
    config: {
      schemaName: string;
      tableName: string;
      connectionString?: string;
    },
    namespace?: string,
  ) {
    const kvStore = new PostgresKVStore({
      schemaName: config.schemaName,
      tableName: config.tableName || DEFAULT_TABLE_NAME,
    });
    namespace = namespace || DEFAULT_NAMESPACE;
    super(kvStore, namespace);
  }
}
