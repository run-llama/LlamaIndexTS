import { BaseNode } from "../../Node";
import { QdrantVectorStore } from "../../storage";

export class TestableQdrantVectorStore extends QdrantVectorStore {
  public nodes: BaseNode[] = [];

  public add(nodes: BaseNode[]): Promise<string[]> {
    this.nodes.push(...nodes);
    return super.add(nodes);
  }

  public delete(refDocId: string): Promise<void> {
    this.nodes = this.nodes.filter((node) => node.id_ !== refDocId);
    return super.delete(refDocId);
  }

  public getNodes(): BaseNode[] {
    return this.nodes;
  }
}
