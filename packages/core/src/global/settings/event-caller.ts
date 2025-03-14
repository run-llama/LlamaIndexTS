import { AsyncLocalStorage, randomUUID } from "@llamaindex/env";

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
export function withEventCaller<T>(caller: unknown, fn: () => T) {
  // create a chain of event callers
  const parentCaller = getEventCaller();
  return eventReasonAsyncLocalStorage.run(
    EventCaller.create(caller, parentCaller),
    fn,
  );
}
