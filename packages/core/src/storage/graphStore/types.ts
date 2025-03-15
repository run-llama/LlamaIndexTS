import { GenericFileSystem } from "../FileSystem";

export interface GraphStore {
  client(): any;
  get(subj: string): Promise<string[][]>;
  // def get_rel_map(self, subjs: Optional[List[str]] = None, depth: int = 2, limit: int = 30) -> Dict[str, List[List[str]]]:
  upsert_triplet(subj: string, rel: String, obj: String): Promise<void>;
  delete(refDocId: string, deleteKwargs?: any): Promise<void>;
  persist(persistPath: string, fs?: GenericFileSystem): Promise<void>;
  get_schema(refresh?: boolean): Promise<String>;
  query(query: string, param_map?: Map<String, any>): Promise<any>;
}
