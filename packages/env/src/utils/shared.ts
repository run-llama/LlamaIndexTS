export class NotSupportCurrentRuntimeClass {
  constructor(runtime: string) {
    throw new Error(`Current environment ${runtime} is not supported`);
  }

  static bind(runtime: string) {
    return class extends NotSupportCurrentRuntimeClass {
      constructor(...args: any[]) {
        super(runtime);
      }
    } as any;
  }
}

// This is a workaround for the lack of globalThis in some environments
// It's being used across multiple places inside the `env` package
export const glo: any =
  typeof globalThis !== "undefined"
    ? globalThis
    : // @ts-expect-error
      typeof window !== "undefined"
      ? // @ts-expect-error
        window
      : typeof global !== "undefined"
        ? global
        : {};
