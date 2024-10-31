const defaultCollection = "data";

// fixme: remove any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoredValue = Record<string, any> | null;

export abstract class BaseKVStore {
  abstract put(
    key: string,
    val: StoredValue,
    collection?: string,
  ): Promise<void>;
  abstract get(key: string, collection?: string): Promise<StoredValue>;
  abstract getAll(collection?: string): Promise<Record<string, StoredValue>>;
  abstract delete(key: string, collection?: string): Promise<boolean>;
}

export abstract class BaseInMemoryKVStore extends BaseKVStore {
  abstract persist(persistPath: string): void;
  static fromPersistPath(persistPath: string): BaseInMemoryKVStore {
    throw new Error("Method not implemented.");
  }
}
