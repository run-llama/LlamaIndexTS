import type { GenericFileSystem } from "@llamaindex/env/type";
const defaultCollection = "data";

type StoredValue = Record<string, any> | null;

export abstract class BaseKVStore {
  abstract put(
    key: string,
    val: Record<string, any>,
    collection?: string,
  ): Promise<void>;
  abstract get(key: string, collection?: string): Promise<StoredValue>;
  abstract getAll(collection?: string): Promise<Record<string, StoredValue>>;
  abstract delete(key: string, collection?: string): Promise<boolean>;
}

export abstract class BaseInMemoryKVStore extends BaseKVStore {
  abstract persist(persistPath: string, fs?: GenericFileSystem): void;
  static fromPersistPath(persistPath: string): BaseInMemoryKVStore {
    throw new Error("Method not implemented.");
  }
}
