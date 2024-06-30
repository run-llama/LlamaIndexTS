import { getEnv } from "@llamaindex/env";
import { Settings } from "../global";
import type { BaseNode } from "../schema/node";

const emitOnce = false;

export function chunkSizeCheck<
  This extends { id_: string },
  Args extends any[],
  Return,
>(
  contentGetter: (this: This, ...args: Args) => string,
  _context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  return function (this: This, ...args: Args) {
    const content = contentGetter.call(this, ...args);
    const chunkSize = Settings.chunkSize;
    const enableChunkSizeCheck = getEnv("ENABLE_CHUNK_SIZE_CHECK") === "true";
    if (
      enableChunkSizeCheck &&
      chunkSize !== undefined &&
      content.length > chunkSize
    ) {
      console.warn(
        `Node (${this.id_}) is larger than chunk size: ${content.length} > ${chunkSize}`,
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
