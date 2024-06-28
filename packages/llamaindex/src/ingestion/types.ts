import type { BaseNode } from "@llamaindex/core/schema";

export interface TransformComponent {
  transform(nodes: BaseNode[], options?: any): Promise<BaseNode[]>;
}
