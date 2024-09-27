import { assertExists } from "../utils";
import {
  type EventTypes,
  StartEvent,
  StopEvent,
  WorkflowEvent,
} from "./events";

export interface Context {}

export type StepFunction<T extends WorkflowEvent = WorkflowEvent> = (
  context: Context,
  ...events: T[]
) => Promise<WorkflowEvent>;

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

export class WorkflowContext<Start = string>
  implements AsyncIterable<WorkflowEvent, void, void>, Promise<StopEvent>
{
  readonly #steps: ReadonlyStepMap;

  readonly #startEvent: StartEvent<Start>;
  readonly #queue: WorkflowEvent[] = [];
  readonly #globals: Map<string, any> = new Map();

  #timeout: number | null = null;
  #verbose: boolean = false;

  #stepCache: WeakMap<
    WorkflowEvent,
    [step: Set<StepFunction>, stepInputs: WeakMap<StepFunction, EventTypes[]>]
  > = new Map();
  #getStepFunction(
    event: WorkflowEvent,
  ): [
    step: Set<StepFunction>,
    stepInputs: WeakMap<StepFunction, EventTypes[]>,
  ] {
    if (this.#stepCache.has(event)) {
      return this.#stepCache.get(event)!;
    }
    const set = new Set<StepFunction>();
    const stepInputs = new WeakMap<StepFunction, EventTypes[]>();
    const res: [
      step: Set<StepFunction>,
      stepInputs: WeakMap<StepFunction, EventTypes[]>,
    ] = [set, stepInputs];
    this.#stepCache.set(event, res);
    for (const [step, { inputs }] of this.#steps) {
      if (inputs.some((input) => event instanceof input)) {
        set.add(step);
        stepInputs.set(step, inputs);
      }
    }
    return res;
  }

  constructor(params: ContextParams<Start>) {
    this.#steps = params.steps;
    this.#startEvent = params.startEvent;
    if (typeof params.timeout === "number") {
      this.#timeout = params.timeout;
    }
    this.#verbose = params.verbose ?? false;

    // push start event to the queue
    const [step] = this.#getStepFunction(this.#startEvent);
    if (step.size === 0) {
      throw new TypeError("No step found for start event");
    }
    this.#queue.push(this.#startEvent);
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

  #pendingInputQueue: WorkflowEvent[] = [];
  /**
   * Stream events from the start event, and do BFS on the event graph.
   *
   * Note that this function will stop once there's no more future events,
   *  if you want stop immediately once reach a StopEvent, you should handle it in the other side.
   * @private
   */
  async *#createStreamEvents(): AsyncGenerator<WorkflowEvent, void, void> {
    while (true) {
      const event = this.#queue.shift();
      if (event) {
        yield event;
        const [steps, inputsMap] = this.#getStepFunction(event);
        for (const step of steps) {
          const inputs = inputsMap.get(step);
          assertExists(inputs);
          const acceptableInputs: WorkflowEvent[] =
            this.#pendingInputQueue.filter((event) =>
              inputs.some((input) => event instanceof input),
            );
          const events: WorkflowEvent[] = [event, ...acceptableInputs];
          assertExists(
            events.length === inputs.length,
            `Expect ${inputs.length} inputs, but got ${events.length}`,
          );
          const nextEvent: WorkflowEvent = await step.call(
            null,
            this,
            ...events.sort((a, b) => {
              const aIndex = inputs.indexOf(a.constructor as EventTypes);
              const bIndex = inputs.indexOf(b.constructor as EventTypes);
              return aIndex - bIndex;
            }),
          );
          acceptableInputs.forEach((input) => {
            const index = this.#pendingInputQueue.indexOf(input);
            this.#pendingInputQueue.splice(index, 1);
          });
          this.#pendingInputQueue.unshift(nextEvent);
          if (nextEvent instanceof StopEvent) {
            yield nextEvent;
          } else {
            this.#queue.push(nextEvent);
          }
        }
      } else {
        return;
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
    if (this.#timeout !== null) {
      const timeout = this.#timeout;
      this.#signal = AbortSignal.timeout(timeout * 1000);
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
            return resolve(event);
          }
        }
        const nextValue = await this.#iteratorSingleton.next();
        if (nextValue.done === false) {
          return reject(new Error("Workflow did not complete"));
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
