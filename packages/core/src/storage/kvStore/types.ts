import { GenericFileSystem } from "../FileSystem";
const defaultCollection = "data";

type StoredValue = { [key: string]: any } | null;

export abstract class BaseKVStore {
  abstract put(
    key: string,
    val: { [key: string]: any },
    collection?: string
  ): Promise<void>;
  abstract get(key: string, collection?: string): Promise<StoredValue>;
  abstract getAll(collection?: string): Promise<{ [key: string]: StoredValue }>;
  abstract delete(key: string, collection?: string): Promise<boolean>;
}

export abstract class BaseInMemoryKVStore extends BaseKVStore {
  abstract persist(persistPath: string, fs?: GenericFileSystem): void;
  static fromPersistPath(persistPath: string): BaseInMemoryKVStore {
    throw new Error("Method not implemented.");
  }
}
