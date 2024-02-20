import { IndexStruct } from "../../indices/BaseIndex";
import { GenericFileSystem } from "../FileSystem";

export abstract class BaseIndexStore {
  abstract getIndexStructs(): Promise<IndexStruct[]>;

  abstract addIndexStruct(indexStruct: IndexStruct): Promise<void>;

  abstract deleteIndexStruct(key: string): Promise<void>;

  abstract getIndexStruct(structId?: string): Promise<IndexStruct | undefined>;

  abstract persist(persistPath: string, fs?: GenericFileSystem): Promise<void>;
}
