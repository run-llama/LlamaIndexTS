import { assertExists } from "../utils";
import {
  type EventTypes,
  StartEvent,
  StopEvent,
  WorkflowEvent,
} from "./events";

export type StepFunction<
  Start = string,
  T extends WorkflowEvent = WorkflowEvent,
> = (context: Context<Start>, ev: T) => Promise<WorkflowEvent>;

export type StepMap = Map<
  StepFunction<any>,
  { inputs: EventTypes[]; outputs: EventTypes[] | undefined }
>;

export type ReadonlyStepMap = ReadonlyMap<
  StepFunction<any>,
  { inputs: EventTypes[]; outputs: EventTypes[] | undefined }
>;

export type ContextParams<Start> = {
  startEvent: StartEvent<Start>;
  steps: StepMap;
  timeout: number | null;
  verbose: boolean;
};

export class Context<Start = string>
  implements AsyncIterable<WorkflowEvent, void, void>, Promise<StopEvent>
{
  readonly #steps: ReadonlyStepMap;
  // reverse map of #steps, helper for get the next step
  readonly #eventMap: WeakMap<typeof WorkflowEvent, StepFunction<Start>>;

  readonly #startEvent: StartEvent<Start>;
  readonly #queue: WorkflowEvent[] = [];
  readonly #globals: Map<string, any> = new Map();

  #eventBuffer: Map<EventTypes, WorkflowEvent[]> = new Map();

  #running: boolean = true;
  #timeout: number | null = null;
  #verbose: boolean = false;

  #getStepFunction(event: WorkflowEvent): StepFunction<Start> | undefined {
    return this.#eventMap.get(event.constructor as EventTypes);
  }

  get running(): boolean {
    return this.#running;
  }

  constructor(params: ContextParams<Start>) {
    this.#steps = params.steps;
    this.#startEvent = params.startEvent;
    // init eventMap
    this.#eventMap = new WeakMap();
    for (const [step, { inputs }] of this.#steps) {
      for (const input of inputs) {
        this.#eventMap.set(input, step);
      }
    }

    if (typeof params.timeout === "number") {
      this.#timeout = params.timeout;
    }
    this.#verbose = params.verbose ?? false;

    // push start event to the queue
    const step = this.#getStepFunction(this.#startEvent);
    assertExists(step, "No step found for start event");
    this.#pushEvent(this.#startEvent, step);
  }

  // these two API is not type safe
  set(key: string, value: any): void {
    this.#globals.set(key, value);
  }

  get(key: string, defaultValue?: any): any {
    if (this.#globals.has(key)) {
      return this.#globals.get(key);
    } else if (defaultValue !== undefined) {
      return defaultValue;
    }
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

  #pushEvent(event: WorkflowEvent, step: StepFunction<Start>): void {
    const stepName = step.name ? `step ${step.name}` : "all steps";
    if (this.#verbose) {
      console.log(`Sending event ${event} to ${stepName}`);
    }

    if (!this.#steps.has(step)) {
      throw new Error(`Step ${step} does not exist`);
    }

    this.#queue.push(event);
  }

  // make sure it will only be called once
  #iterator: AsyncGenerator<WorkflowEvent, void, void> | null = null;
  #signal: AbortSignal | null = null;
  get #iteratorSingleton(): AsyncGenerator<WorkflowEvent, void, void> {
    if (this.#iterator === null) {
      this.#iterator = this.#createStreamEvents();
    }
    return this.#iterator;
  }

  [Symbol.asyncIterator](): AsyncGenerator<WorkflowEvent, void, void> {
    return this.#iteratorSingleton;
  }

  async *#createStreamEvents(): AsyncGenerator<WorkflowEvent, void, void> {
    while (true) {
      const event = this.#queue.shift();
      if (event) {
        yield event;
        // event handling
        const step = this.#getStepFunction(event);
        assertExists(step, `No step found for event ${event.displayName}`);
        const nextEvent = await step.call(null, this, event);
        if (nextEvent instanceof StopEvent) {
          this.#running = false;
          yield nextEvent;
          return;
        } else {
          const nextStep = this.#getStepFunction(nextEvent);
          assertExists(
            nextStep,
            `No step found for event ${nextEvent.displayName}`,
          );
          this.#pushEvent(nextEvent, nextStep);
        }
      } else {
        if (!this.#running) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  then<TResult1, TResult2 = never>(
    onfulfilled?:
      | ((value: StopEvent) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ) {
    const stopWorkflow = () => {
      if (this.#running) {
        this.#running = false;
      }
    };

    if (this.#timeout !== null) {
      const timeout = this.#timeout;
      this.#signal = AbortSignal.timeout(timeout * 1000);
      this.#signal.addEventListener(
        "abort",
        () => {
          stopWorkflow();
        },
        {
          once: true,
        },
      );
    }

    return new Promise<StopEvent>(async (resolve, reject) => {
      this.#signal?.addEventListener("abort", () => {
        reject(new Error(`Operation timed out after ${this.#timeout} seconds`));
      });
      try {
        for await (const event of this.#iteratorSingleton) {
          if (event instanceof StartEvent) {
            if (this.#verbose) {
              console.log(`Starting workflow with event ${event}`);
            }
          }
          if (event instanceof StopEvent) {
            resolve(event);
          }
        }
        const nextValue = await this.#iteratorSingleton.next();
        if (nextValue.done === false) {
          reject(new Error("Workflow did not complete"));
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(err);
      }
    })
      .then(onfulfilled)
      .catch(onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ) {
    return this.then((v) => v, onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null) {
    return this.then(
      () => {
        onfinally?.();
      },
      () => {
        onfinally?.();
      },
    ) as Promise<any>;
  }

  [Symbol.toStringTag]: string = "Context";
}
