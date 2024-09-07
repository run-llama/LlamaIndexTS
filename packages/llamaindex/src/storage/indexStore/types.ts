import {
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
  DEFAULT_PERSIST_DIR,
} from "@llamaindex/core/global";
import { path } from "@llamaindex/env";
import type { IndexStruct } from "../../indices/IndexStruct.js";

const defaultPersistPath = path.join(
  DEFAULT_PERSIST_DIR,
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
);

export abstract class BaseIndexStore {
  abstract getIndexStructs(): Promise<IndexStruct[]>;

  abstract addIndexStruct(indexStruct: IndexStruct): Promise<void>;

  abstract deleteIndexStruct(key: string): Promise<void>;

  abstract getIndexStruct(structId?: string): Promise<IndexStruct | undefined>;

  async persist(persistPath: string = defaultPersistPath): Promise<void> {
    // Persist the index store to disk.
  }
}
