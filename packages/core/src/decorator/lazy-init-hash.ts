import type { BaseNode } from "../schema";

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
