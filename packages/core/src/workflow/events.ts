export class WorkflowEvent<T extends Record<string, any> = any> {
  displayName: string;
  data: T;

  constructor(data: T) {
    this.data = data;
    this.displayName = this.constructor.name;
  }

  toString() {
    return this.displayName;
  }
}

export type EventTypes<T extends Record<string, any> = any> = new (
  data: T,
) => WorkflowEvent<T>;

export class StartEvent<T = string> extends WorkflowEvent<{ input: T }> {}
export class StopEvent<T = string> extends WorkflowEvent<{ result: T }> {}
