// Web doesn't have AsyncLocalStorage and there's no alternative way to implement it
// Wait for https://github.com/tc39/proposal-async-context
export class AsyncLocalStorage<T> {
  #store: T = null!;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static bind<Func extends (...args: any[]) => any>(fn: Func): Func {
    return fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static snapshot(): <R, TArgs extends any[]>(
    fn: (...args: TArgs) => R,
    ...args: TArgs
  ) => R {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (cb: any, ...args: any[]) => cb(...args);
  }

  getStore() {
    return this.#store;
  }

  run<R>(store: T, cb: () => R): R {
    this.#store = store;
    if (cb.constructor.name === "AsyncFunction") {
      console.warn("AsyncLocalStorage is not supported in the web environment");
      console.warn("Please note that some features may not work as expected");
    }
    return cb();
  }
}
