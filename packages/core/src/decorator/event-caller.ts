import { AsyncLocalStorage } from "@llamaindex/env";
import { withEventCaller } from "../global";
import { isAsyncIterable, isIterable } from "../utils";

export function wrapEventCaller<This, Result, Args extends unknown[]>(
  originalMethod: (this: This, ...args: Args) => Result,
  context: ClassMethodDecoratorContext<object>,
) {
  const name = context.name;
  context.addInitializer(function () {
    // @ts-expect-error - this is a valid assignment
    const fn = this[name].bind(this);
    // @ts-expect-error - this is a valid assignment
    this[name] = (...args: unknown[]) => {
      return withEventCaller(this, () => fn(...args));
    };
  });
  return function (this: This, ...args: Args): Result {
    const result = originalMethod.call(this, ...args);
    // patch for iterators because AsyncLocalStorage doesn't work with them
    if (isAsyncIterable(result)) {
      const iter = result[Symbol.asyncIterator]();
      const snapshot = AsyncLocalStorage.snapshot();
      return (async function* asyncGeneratorWrapper() {
        while (true) {
          const { value, done } = await snapshot(() => iter.next());
          if (done) {
            break;
          }
          yield value;
        }
      })() as Result;
    } else if (isIterable(result)) {
      const iter = result[Symbol.iterator]();
      const snapshot = AsyncLocalStorage.snapshot();
      return (function* generatorWrapper() {
        while (true) {
          const { value, done } = snapshot(() => iter.next());
          if (done) {
            break;
          }
          yield value;
        }
      })() as Result;
    }
    return result;
  };
}
