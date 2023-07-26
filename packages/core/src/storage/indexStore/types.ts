import { IndexStruct } from "../../indices/BaseIndex";
import { GenericFileSystem } from "../FileSystem";
import {
  DEFAULT_PERSIST_DIR,
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
} from "../constants";

const defaultPersistPath = `${DEFAULT_PERSIST_DIR}/${DEFAULT_INDEX_STORE_PERSIST_FILENAME}`;

export abstract class BaseIndexStore {
  abstract getIndexStructs(): Promise<IndexStruct[]>;

  abstract addIndexStruct(indexStruct: IndexStruct): Promise<void>;

  abstract deleteIndexStruct(key: string): Promise<void>;

  abstract getIndexStruct(structId?: string): Promise<IndexStruct | undefined>;

  async persist(
    persistPath: string = defaultPersistPath,
    fs?: GenericFileSystem
  ): Promise<void> {
    // Persist the index store to disk.
  }
}
