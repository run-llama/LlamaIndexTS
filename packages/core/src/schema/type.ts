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
    Object.defineProperties(
      transformFn,
      Object.getOwnPropertyDescriptors(this.constructor.prototype),
    );
    const transform = function transform(
      ...args: Parameters<TransformComponentSignature>
    ) {
      return transformFn(...args);
    };
    Reflect.setPrototypeOf(transform, new.target.prototype);
    return transform;
  }
}
