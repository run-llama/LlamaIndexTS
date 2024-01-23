import { BaseNode } from "../Node";

export interface TransformComponent {
  transform(nodes: BaseNode[], options?: any): Promise<BaseNode[]>;
}
