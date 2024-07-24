import type { BaseNode } from "./node";

export interface TransformComponent {
  transform<Options extends Record<string, unknown>>(
    nodes: BaseNode[],
    options?: Options,
  ): Promise<BaseNode[]>;
}
