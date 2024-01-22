import { BaseNode } from "../Node";

export enum DocstoreStrategy {
  UPSERTS = "upserts",
  DUPLICATES_ONLY = "duplicates_only",
  UPSERTS_AND_DELETE = "upserts_and_delete",
}

export interface TransformComponent {
  transform(nodes: BaseNode[], options?: any): Promise<BaseNode[]>;
}
