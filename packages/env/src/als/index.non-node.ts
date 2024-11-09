// Async Local Storage is available cross different JS runtimes
// @ts-expect-error AsyncLocalStorage is not defined in Non Node.js environment
export const AsyncLocalStorage = globalThis.AsyncLocalStorage;
