import { TransformComponent, type BaseNode } from "@llamaindex/core/schema";

export class RollbackableTransformComponent extends TransformComponent {
  public async rollback(nodes: BaseNode[]): Promise<void> {
    return Promise.resolve();
  }
}
