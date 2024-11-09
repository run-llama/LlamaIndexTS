import { DEFAULT_NAMESPACE } from "@llamaindex/core/global";
import { noneSerializer } from "@llamaindex/core/storage/doc-store";
import {
  PostgresKVStore,
  type PostgresKVStoreConfig,
} from "../kvStore/PostgresKVStore.js";
import { KVDocumentStore } from "./KVDocumentStore.js";

const DEFAULT_TABLE_NAME = "llamaindex_doc_store";

export type PostgresDocumentStoreConfig = PostgresKVStoreConfig & {
  namespace?: string;
};

export class PostgresDocumentStore extends KVDocumentStore {
  serializer = noneSerializer;

  constructor(config?: PostgresDocumentStoreConfig) {
    const kvStore = new PostgresKVStore({
      schemaName: config?.schemaName,
      tableName: config?.tableName || DEFAULT_TABLE_NAME,
      ...(config && "clientConfig" in config
        ? { clientConfig: config.clientConfig }
        : config && "client" in config
          ? {
              client: config.client,
              shouldConnect: config.shouldConnect ?? false,
            }
          : {}),
    });
    const namespace = config?.namespace || DEFAULT_NAMESPACE;
    super(kvStore, namespace);
  }
}
