import type { BaseNode } from "./node";

export interface TransformComponent<Options extends Record<string, unknown>> {
  transform(nodes: BaseNode[], options?: Options): Promise<BaseNode[]>;
}
