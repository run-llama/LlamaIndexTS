export class WorkflowEvent<T extends Record<string, any> = any> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }

  toString() {
    return `${this.constructor.name}(${JSON.stringify(this.data)})`;
  }
}

export type EventTypes<T extends Record<string, any> = any> = new (
  data: T,
) => WorkflowEvent<T>;

export class StartEvent extends WorkflowEvent<{ input: string }> {}
export class StopEvent extends WorkflowEvent<{ result: string }> {}
