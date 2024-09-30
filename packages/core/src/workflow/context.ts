import { assertExists } from "../utils";
import {
  type EventTypes,
  StartEvent,
  StopEvent,
  WorkflowEvent,
} from "./events";

export type Context<Data = unknown> = Data;

export type StepFunction<
  Data = unknown,
  In extends (typeof WorkflowEvent<any>)[] = (typeof WorkflowEvent<any>)[],
  Out extends WorkflowEvent<any> = WorkflowEvent<any>,
> = <T extends { [K in keyof In]: InstanceType<In[K]> }>(
  context: Context<Data>,
  ...events: T
) => Promise<Out>;

export type ReadonlyStepMap = ReadonlyMap<
  StepFunction<any>,
  { inputs: EventTypes[]; outputs: EventTypes[] | undefined }
>;

export type ContextParams<Start, Stop, Data> = {
  startEvent: StartEvent<Start>;
  contextData: Data;
  steps: ReadonlyStepMap;
  timeout: number | null;
  verbose: boolean;

  queue: WorkflowEvent[] | undefined;
  pendingInputQueue: WorkflowEvent[] | undefined;
  resolved: StopEvent<Stop> | null | undefined;
  rejected: Error | null | undefined;
};

export class WorkflowContext<Start = string, Stop = string, Data = any>
  implements AsyncIterable<WorkflowEvent, void, void>, Promise<StopEvent<Stop>>
{
  readonly #steps: ReadonlyStepMap;

  readonly #startEvent: StartEvent<Start>;
  readonly #queue: WorkflowEvent[] = [];

  #timeout: number | null = null;
  #verbose: boolean = false;
  #data: Data;

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

  constructor(params: ContextParams<Start, Stop, Data>) {
    this.#steps = params.steps;
    this.#startEvent = params.startEvent;
    if (typeof params.timeout === "number") {
      this.#timeout = params.timeout;
    }
    this.#data = params.contextData;
    this.#verbose = params.verbose ?? false;

    // push start event to the queue
    const [step] = this.#getStepFunction(this.#startEvent);
    if (step.size === 0) {
      throw new TypeError("No step found for start event");
    }

    // restore from snapshot
    if (params.queue) {
      this.#queue.push(...params.queue);
    } else {
      this.#queue.push(this.#startEvent);
    }
    if (params.pendingInputQueue) {
      this.#pendingInputQueue = params.pendingInputQueue;
    }
    if (params.resolved) {
      this.#resolved = params.resolved;
    }
    if (params.rejected) {
      this.#rejected = params.rejected;
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

  snapshot(): ArrayBuffer {
    const state = {
      startEvent: this.#startEvent,
      queue: this.#queue,
      pendingInputQueue: this.#pendingInputQueue,
      data: this.#data,
      timeout: this.#timeout,
      verbose: this.#verbose,
      resolved: this.#resolved,
      rejected: this.#rejected,
    };

    const jsonString = JSON.stringify(state, (_, value) => {
      // If value is an instance of a class, serialize only its properties
      if (value instanceof WorkflowEvent) {
        return { data: value.data, constructor: value.constructor.name };
      }
      return value;
    });

    return new TextEncoder().encode(jsonString).buffer;
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
        const nextEventPromises = [...steps].map(async (step) => {
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
          return step
            .call(
              null,
              this.#data,
              ...events.sort((a, b) => {
                const aIndex = inputs.indexOf(a.constructor as EventTypes);
                const bIndex = inputs.indexOf(b.constructor as EventTypes);
                return aIndex - bIndex;
              }),
            )
            .then((nextEvent: WorkflowEvent) => {
              acceptableInputs.forEach((input) => {
                const index = this.#pendingInputQueue.indexOf(input);
                this.#pendingInputQueue.splice(index, 1);
              });
              if (!(nextEvent instanceof StopEvent)) {
                this.#pendingInputQueue.unshift(nextEvent);
                this.#queue.push(nextEvent);
              }
              return nextEvent;
            });
        });
        const fastestNextEvent = await Promise.race(nextEventPromises);
        if (fastestNextEvent instanceof StopEvent) {
          yield fastestNextEvent;
        }
        const allNextEvents = await Promise.all(nextEventPromises);
        for (const nextEvent of allNextEvents) {
          if (nextEvent instanceof StopEvent) {
            // don't yield the same event twice
            if (fastestNextEvent !== nextEvent) {
              yield nextEvent;
            }
          }
        }
      } else {
        return;
      }
    }
  }

  with<Initial extends Data>(
    data: Initial,
  ): WorkflowContext<Start, Stop, Initial> {
    return new WorkflowContext({
      startEvent: this.#startEvent,
      contextData: data,
      steps: this.#steps,
      timeout: this.#timeout,
      verbose: this.#verbose,
      queue: undefined,
      pendingInputQueue: undefined,
      resolved: undefined,
      rejected: undefined,
    });
  }

  #resolved: StopEvent<Stop> | null = null;
  #rejected: Error | null = null;
  then<TResult1, TResult2 = never>(
    onfulfilled?:
      | ((value: StopEvent<Stop>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ) {
    if (this.#resolved !== null) {
      return Promise.resolve(this.#resolved).then(onfulfilled, onrejected);
    }
    if (this.#rejected !== null) {
      return Promise.reject(this.#rejected).then(onfulfilled, onrejected);
    }
    if (this.#timeout !== null) {
      const timeout = this.#timeout;
      this.#signal = AbortSignal.timeout(timeout * 1000);
    }

    return new Promise<StopEvent<Stop>>(async (resolve, reject) => {
      this.#signal?.addEventListener("abort", () => {
        this.#rejected = new Error(
          `Operation timed out after ${this.#timeout} seconds`,
        );
        reject(this.#rejected);
      });
      try {
        for await (const event of this.#iteratorSingleton) {
          if (event instanceof StartEvent) {
            if (this.#verbose) {
              console.log(`Starting workflow with event ${event}`);
            }
          }
          if (event instanceof StopEvent) {
            if (this.#verbose && this.#pendingInputQueue.length > 0) {
              console.warn(
                "There are pending events in the queue, check your in-degree and out-degree of the graph",
              );
            }
            this.#resolved = event;
            return resolve(event);
          }
        }
        const nextValue = await this.#iteratorSingleton.next();
        if (nextValue.done === false) {
          this.#rejected = new Error("Workflow did not complete");
          return reject(this.#rejected);
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
