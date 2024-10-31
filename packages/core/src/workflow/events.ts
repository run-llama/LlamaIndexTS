// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class WorkflowEvent<T extends Record<string, any> = any> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }

  toString() {
    return `${this.constructor.name}(${JSON.stringify(this.data)})`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventTypes<T extends Record<string, any> = any> = new (
  data: T,
) => WorkflowEvent<T>;

export class StartEvent<T = string> extends WorkflowEvent<{ input: T }> {}
export class StopEvent<T = string> extends WorkflowEvent<{ result: T }> {}
