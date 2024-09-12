export const UNNAMED_EVENT = "UnnamedEvent";

export class WorkflowEvent {
  toString() {
    return `${this.constructor.name}(${JSON.stringify(this)})`;
  }
}

export type EventTypes<T extends Record<string, any> = any> = new (
  data: T,
) => WorkflowEvent & T;

export function createEventType<T extends Record<string, any>>(
  name: string = UNNAMED_EVENT,
): EventTypes<T> {
  const EventClass = class extends WorkflowEvent {
    constructor(data: T) {
      super();
      Object.assign(this, data);
    }
  };
  // EventClass is unnamed, let's give it a name so it's behaving like a named sub class of WorkflowEvent
  Object.defineProperty(EventClass, "name", { value: name });
  return EventClass as EventTypes<T>;
}

export const StartEvent = createEventType<{ input: string }>("StartEvent");
export const StopEvent = createEventType<{ result: string }>("StopEvent");
export type StartEvent = InstanceType<typeof StartEvent>;
export type StopEvent = InstanceType<typeof StopEvent>;
