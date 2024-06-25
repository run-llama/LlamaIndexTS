import { AsyncLocalStorage, randomUUID } from "@llamaindex/env";
import { isAsyncIterable, isIterable } from "../utils.js";

const eventReasonAsyncLocalStorage = new AsyncLocalStorage<EventCaller>();

/**
 * EventCaller is used to track the caller of an event.
 */
export class EventCaller {
  public readonly id = randomUUID();

  private constructor(
    public readonly caller: unknown,
    public readonly parent: EventCaller | null,
  ) {}

  #computedCallers: unknown[] | null = null;

  public get computedCallers(): unknown[] {
    if (this.#computedCallers != null) {
      return this.#computedCallers;
    }
    const callers = [this.caller];
    let parent = this.parent;
    while (parent != null) {
      callers.push(parent.caller);
      parent = parent.parent;
    }
    this.#computedCallers = callers;
    return callers;
  }

  public static create(
    caller: unknown,
    parent: EventCaller | null,
  ): EventCaller {
    return new EventCaller(caller, parent);
  }
}

export function getEventCaller(): EventCaller | null {
  return eventReasonAsyncLocalStorage.getStore() ?? null;
}

/**
 * @param caller who is calling this function, pass in `this` if it's a class method
 * @param fn
 */
function withEventCaller<T>(caller: unknown, fn: () => T) {
  // create a chain of event callers
  const parentCaller = getEventCaller();
  return eventReasonAsyncLocalStorage.run(
    EventCaller.create(caller, parentCaller),
    fn,
  );
}

export function wrapEventCaller<This, Result, Args extends unknown[]>(
  originalMethod: (this: This, ...args: Args) => Result,
  context: ClassMethodDecoratorContext<object>,
) {
  const name = context.name;
  context.addInitializer(function () {
    // @ts-expect-error
    const fn = this[name].bind(this);
    // @ts-expect-error
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
