import { IndexStruct } from "llama_index/data_structs/data_structs";
import { GenericFileSystem } from "../FileSystem";
import { DEFAULT_PERSIST_DIR, DEFAULT_INDEX_STORE_PERSIST_FILENAME } from "../constants";

const defaultPersistPath = `${DEFAULT_PERSIST_DIR}/${DEFAULT_INDEX_STORE_PERSIST_FILENAME}`;

export abstract class BaseIndexStore {
    abstract getIndexStructs(): IndexStruct[];

    abstract addIndexStruct(indexStruct: IndexStruct): void;

    abstract deleteIndexStruct(key: string): void;

    abstract getIndexStruct(structId?: string): IndexStruct | null;

    persist(persistPath: string = defaultPersistPath, fs?: GenericFileSystem): void {
        // Persist the index store to disk.
    }
}
