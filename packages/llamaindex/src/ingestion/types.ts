import type { BaseNode } from "../Node.js";

export interface TransformComponent {
  transform(nodes: BaseNode[], options?: any): Promise<BaseNode[]>;
}
