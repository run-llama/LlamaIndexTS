export class NotSupportCurrentRuntimeClass {
  constructor(runtime: string) {
    throw new Error(`Current environment ${runtime} is not supported`);
  }

  static bind(runtime: string) {
    return class extends NotSupportCurrentRuntimeClass {
      constructor(...args: any[]) {
        super(runtime);
      }
    };
  }
}

// This is a workaround for the lack of globalThis in some environments
// It's being used across multiple places inside the `env` package
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const glo: any =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
        ? global
        : {};
