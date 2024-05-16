import { getEnv } from "@llamaindex/env";
import type { BaseNode } from "../../Node.js";
import { getChunkSize } from "../settings/chunk-size.js";

const emitOnce = false;

export function chunkSizeCheck(
  contentGetter: () => string,
  _context: ClassMethodDecoratorContext | ClassGetterDecoratorContext,
) {
  return function <Node extends BaseNode>(this: Node) {
    const content = contentGetter.call(this);
    const chunkSize = getChunkSize();
    const enableChunkSizeCheck = getEnv("ENABLE_CHUNK_SIZE_CHECK") === "true";
    if (
      enableChunkSizeCheck &&
      chunkSize !== undefined &&
      content.length > chunkSize
    ) {
      console.warn(
        `Node (${this.id_}) is larger than chunk size: ${content.length}`,
      );
      if (!emitOnce) {
        console.warn(
          "Will truncate the content if it is larger than chunk size",
        );
        console.warn("If you want to disable this behavior:");
        console.warn("  1. Set Settings.chunkSize = undefined");
        console.warn("  2. Set Settings.chunkSize to a larger value");
        console.warn(
          "  3. Change the way of splitting content into smaller chunks",
        );
      }
      return content.slice(0, chunkSize);
    }
    return content;
  };
}

export function lazyInitHash(
  value: ClassAccessorDecoratorTarget<BaseNode, string>,
  _context: ClassAccessorDecoratorContext,
): ClassAccessorDecoratorResult<BaseNode, string> {
  return {
    get() {
      const oldValue = value.get.call(this);
      if (oldValue === "") {
        const hash = this.generateHash();
        value.set.call(this, hash);
      }
      return value.get.call(this);
    },
    set(newValue: string) {
      value.set.call(this, newValue);
    },
    init(value: string): string {
      return value;
    },
  };
}
