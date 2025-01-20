import { DEFAULT_NAMESPACE } from "@llamaindex/core/global";
import { KVIndexStore } from "@llamaindex/core/storage/index-store";
import { PostgresKVStore, type PostgresKVStoreConfig } from "./PostgresKVStore";

const DEFAULT_TABLE_NAME = "llamaindex_index_store";

export type PostgresIndexStoreConfig = PostgresKVStoreConfig & {
  namespace?: string;
};

export class PostgresIndexStore extends KVIndexStore {
  constructor(config?: PostgresIndexStoreConfig) {
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
