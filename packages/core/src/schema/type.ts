import type { BaseNode } from "./node";

interface TransformComponentSignature {
  <Options extends Record<string, unknown>>(
    nodes: BaseNode[],
    options?: Options,
  ): Promise<BaseNode[]>;
}

export interface TransformComponent extends TransformComponentSignature {}

export class TransformComponent {
  constructor(transformFn: TransformComponentSignature) {
    return transformFn;
  }
}
