import { GenericFileSystem } from "../FileSystem";
const defaultCollection = "data";

export abstract class BaseKVStore {
    abstract put(key: string, val: {[key: string]: any}, collection?: string): void;
    abstract get(key: string, collection?: string): {[key: string]: any} | null;
    abstract getAll(collection?: string): {[key: string]: {[key: string]: any}};
    abstract delete(key: string, collection?: string): boolean;
}

export abstract class BaseInMemoryKVStore extends BaseKVStore {
    abstract persist(persistPath: string, fs?: GenericFileSystem): void;
    static fromPersistPath(persistPath: string): BaseInMemoryKVStore {
        throw new Error("Method not implemented.");
    }
}
