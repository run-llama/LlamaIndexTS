export class NotSupportCurrentRuntimeClass {
  constructor(runtime: string) {
    throw new Error("Current environment ${runtime} is not supported");
  }

  static bind(runtime: string) {
    return class extends NotSupportCurrentRuntimeClass {
      constructor(...args: any[]) {
        super(runtime);
      }
    } as any;
  }
}
