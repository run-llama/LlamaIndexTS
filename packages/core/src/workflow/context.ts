import { type EventTypes, type WorkflowEvent } from "./events";
import { type StepFunction, type Workflow } from "./workflow";

export class Context {
  #workflow: Workflow;
  #queues: Map<StepFunction, WorkflowEvent[]> = new Map();
  #eventBuffer: Map<EventTypes, WorkflowEvent[]> = new Map();
  #globals: Map<string, any> = new Map();
  #streamingQueue: WorkflowEvent[] = [];
  running: boolean = true;
  #verbose: boolean = false;

  constructor(params: { workflow: Workflow; verbose?: boolean }) {
    this.#workflow = params.workflow;
    this.#verbose = params.verbose ?? false;
  }

  set(key: string, value: any): void {
    this.#globals.set(key, value);
  }

  get(key: string, defaultValue?: any): any {
    if (this.#globals.has(key)) {
      return this.#globals.get(key);
    } else if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Key '${key}' not found in Context`);
  }

  collectEvents(
    event: WorkflowEvent,
    expected: EventTypes[],
  ): WorkflowEvent[] | null {
    const eventType = event.constructor as EventTypes;
    if (!this.#eventBuffer.has(eventType)) {
      this.#eventBuffer.set(eventType, []);
    }
    this.#eventBuffer.get(eventType)!.push(event);

    const retval: WorkflowEvent[] = [];
    for (const expectedType of expected) {
      const events = this.#eventBuffer.get(expectedType);
      if (events && events.length > 0) {
        retval.push(events.shift()!);
      }
    }

    if (retval.length === expected.length) {
      return retval;
    }

    // Put back the events if unable to collect all
    for (const ev of retval) {
      const eventType = ev.constructor as EventTypes;
      if (!this.#eventBuffer.has(eventType)) {
        this.#eventBuffer.set(eventType, []);
      }
      this.#eventBuffer.get(eventType)!.unshift(ev);
    }

    return null;
  }

  sendEvent(message: WorkflowEvent, step?: StepFunction): void {
    const stepName = step?.name ? `step ${step.name}` : "all steps";
    if (this.#verbose) {
      console.log(`Sending event ${message} to ${stepName}`);
    }
    if (step === undefined) {
      for (const queue of this.#queues.values()) {
        queue.push(message);
      }
    } else {
      if (!this.#workflow.hasStep(step)) {
        throw new Error(`Step ${step} does not exist`);
      }

      if (!this.#queues.has(step)) {
        this.#queues.set(step, []);
      }
      this.#queues.get(step)!.push(message);
    }
  }

  getNextEvent(step: StepFunction): WorkflowEvent | undefined {
    const queue = this.#queues.get(step);
    if (queue && queue.length > 0) {
      return queue.shift();
    }
    return undefined;
  }

  writeEventToStream(event: WorkflowEvent): void {
    this.#streamingQueue.push(event);
  }

  async *streamEvents(): AsyncGenerator<WorkflowEvent, void, void> {
    while (true) {
      const event = this.#streamingQueue.shift();
      if (event) {
        yield event;
      } else {
        if (!this.running) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }
}
