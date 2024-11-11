import {
  type AnyWorkflowEventConstructor,
  StartEvent,
  type StartEventConstructor,
  StopEvent,
  type StopEventConstructor,
  WorkflowEvent,
} from "./workflow-event";

export type StepHandler<
  Data = unknown,
  Inputs extends [
    AnyWorkflowEventConstructor | StartEventConstructor,
    ...(AnyWorkflowEventConstructor | StopEventConstructor)[],
  ] = [AnyWorkflowEventConstructor | StartEventConstructor],
  Out extends [
    AnyWorkflowEventConstructor | StartEventConstructor,
    ...(AnyWorkflowEventConstructor | StopEventConstructor)[],
  ] = [AnyWorkflowEventConstructor | StopEventConstructor],
> = (
  context: HandlerContext<Data>,
  ...events: {
    [K in keyof Inputs]: InstanceType<Inputs[K]>;
  }
) => Promise<
  {
    [K in keyof Out]: InstanceType<Out[K]>;
  }[number]
>;

export type ReadonlyStepMap<Data> = ReadonlyMap<
  StepHandler<Data, never, never>,
  {
    inputs: AnyWorkflowEventConstructor[];
    outputs: AnyWorkflowEventConstructor[];
  }
>;

type GlobalEvent = typeof globalThis.Event;

export type Wait = () => Promise<void>;

export type ContextParams<Start, Stop, Data> = {
  startEvent: StartEvent<Start>;
  contextData: Data;
  steps: ReadonlyStepMap<Data>;
  timeout: number | null;
  verbose: boolean;
  wait: Wait;

  queue: QueueProtocol[] | undefined;
  pendingInputQueue: WorkflowEvent<unknown>[] | undefined;
  resolved: StopEvent<Stop> | null | undefined;
  rejected: Error | null | undefined;
};

function flattenEvents(
  acceptEventTypes: AnyWorkflowEventConstructor[],
  inputEvents: WorkflowEvent<unknown>[],
): WorkflowEvent<unknown>[] {
  const eventMap = new Map<
    AnyWorkflowEventConstructor,
    WorkflowEvent<unknown>
  >();

  for (const event of inputEvents) {
    for (const acceptType of acceptEventTypes) {
      if (event instanceof acceptType && !eventMap.has(acceptType)) {
        eventMap.set(acceptType, event);
        break; // Once matched, no need to check other accept types
      }
    }
  }

  return Array.from(eventMap.values());
}

export type HandlerContext<Data = unknown> = {
  get data(): Data;
  sendEvent(event: WorkflowEvent<unknown>): void;
  requireEvent<T extends AnyWorkflowEventConstructor>(
    event: T,
  ): Promise<InstanceType<T>>;
};

export type QueueProtocol =
  | {
      type: "event";
      event: WorkflowEvent<unknown>;
    }
  | {
      type: "requestEvent";
      id: string;
      requestEvent: AnyWorkflowEventConstructor;
    };

export class WorkflowContext<Start = string, Stop = string, Data = unknown>
  implements
    AsyncIterable<WorkflowEvent<unknown>, unknown, void>,
    Promise<StopEvent<Stop>>
{
  readonly #steps: ReadonlyStepMap<Data>;

  readonly #startEvent: StartEvent<Start>;
  readonly #queue: QueueProtocol[] = [];
  readonly #queueEventTarget = new EventTarget();
  readonly #wait: Wait;

  #timeout: number | null = null;
  #verbose: boolean = false;
  #data: Data;

  #stepCache: WeakMap<
    WorkflowEvent<unknown>,
    [
      step: Set<StepHandler<Data, never, never>>,
      stepInputs: WeakMap<
        StepHandler<Data, never, never>,
        AnyWorkflowEventConstructor[]
      >,
      stepOutputs: WeakMap<
        StepHandler<Data, never, never>,
        AnyWorkflowEventConstructor[]
      >,
    ]
  > = new Map();

  #getStepFunction(
    event: WorkflowEvent<unknown>,
  ): [
    step: Set<StepHandler<Data, never, never>>,
    stepInputs: WeakMap<
      StepHandler<Data, never, never>,
      AnyWorkflowEventConstructor[]
    >,
    stepOutputs: WeakMap<
      StepHandler<Data, never, never>,
      AnyWorkflowEventConstructor[]
    >,
  ] {
    if (this.#stepCache.has(event)) {
      return this.#stepCache.get(event)!;
    }
    const set = new Set<StepHandler<Data, never, never>>();
    const stepInputs = new WeakMap<
      StepHandler<Data, never, never>,
      AnyWorkflowEventConstructor[]
    >();
    const stepOutputs = new WeakMap<
      StepHandler<Data, never, never>,
      AnyWorkflowEventConstructor[]
    >();
    const res: [
      step: Set<StepHandler<Data, never, never>>,
      stepInputs: WeakMap<
        StepHandler<Data, never, never>,
        AnyWorkflowEventConstructor[]
      >,
      stepOutputs: WeakMap<
        StepHandler<Data, never, never>,
        AnyWorkflowEventConstructor[]
      >,
    ] = [set, stepInputs, stepOutputs];
    this.#stepCache.set(event, res);
    for (const [step, { inputs, outputs }] of this.#steps) {
      if (inputs.some((input) => event instanceof input)) {
        set.add(step);
        stepInputs.set(step, inputs);
        stepOutputs.set(step, outputs);
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
    this.#wait = params.wait;

    // push start event to the queue
    const [step] = this.#getStepFunction(this.#startEvent);
    if (step.size === 0) {
      throw new TypeError("No step found for start event");
    }

    // restore from snapshot
    if (params.queue) {
      params.queue.forEach((protocol) => {
        this.#queue.push(protocol);
      });
    } else {
      this.#sendEvent(this.#startEvent);
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
  #iterator: AsyncIterableIterator<WorkflowEvent<unknown>> | null = null;
  #signal: AbortSignal | null = null;

  get #iteratorSingleton(): AsyncIterableIterator<WorkflowEvent<unknown>> {
    if (this.#iterator === null) {
      this.#iterator = this.#createStreamEvents();
    }
    return this.#iterator;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<WorkflowEvent<unknown>> {
    return this.#iteratorSingleton;
  }

  #sendEvent = (event: WorkflowEvent<unknown>): void => {
    this.#queue.push({
      type: "event",
      event,
    });
  };

  #requireEvent = async <T extends AnyWorkflowEventConstructor>(
    event: T,
  ): Promise<InstanceType<T>> => {
    const requestId = crypto.randomUUID();
    this.#queue.push({
      type: "requestEvent",
      id: requestId,
      requestEvent: event,
    });
    return new Promise((resolve) => {
      const handler = (event: InstanceType<GlobalEvent>) => {
        if (event instanceof CustomEvent) {
          const { id } = event.detail;
          if (requestId === id) {
            this.#queueEventTarget.removeEventListener("update", handler);
            resolve(event.detail.event);
          }
        }
      };
      this.#queueEventTarget.addEventListener("update", handler);
    });
  };

  #pendingInputQueue: WorkflowEvent<unknown>[] = [];

  // if strict mode is enabled, it will throw an error if there's input or output events are not expected
  #strict = false;

  strict() {
    this.#strict = true;
    return this;
  }

  get data(): Data {
    return this.#data;
  }

  /**
   * Stream events from the start event
   *
   * Note that this function will stop once there's no more future events,
   *  if you want stop immediately once reach a StopEvent, you should handle it in the other side.
   * @private
   */
  #createStreamEvents(): AsyncIterableIterator<WorkflowEvent<unknown>> {
    const isPendingEvents = new WeakSet<WorkflowEvent<unknown>>();
    const pendingTasks = new Set<Promise<WorkflowEvent<unknown>>>();
    const enqueuedEvents = new Set<WorkflowEvent<unknown>>();
    const stream = new ReadableStream<WorkflowEvent<unknown>>({
      start: async (controller) => {
        while (true) {
          const eventProtocol = this.#queue.shift();
          if (eventProtocol) {
            switch (eventProtocol.type) {
              case "requestEvent": {
                const { id, requestEvent } = eventProtocol;
                const acceptableInput = this.#pendingInputQueue.find(
                  (event) => event instanceof requestEvent,
                );
                if (acceptableInput) {
                  // remove the event from the queue, in case of infinite loop
                  const protocolIdx = this.#queue.findIndex(
                    (protocol) =>
                      protocol.type === "event" &&
                      protocol.event === acceptableInput,
                  );
                  if (protocolIdx !== -1) {
                    this.#queue.splice(protocolIdx, 1);
                  }
                  this.#pendingInputQueue.splice(
                    this.#pendingInputQueue.indexOf(acceptableInput),
                    1,
                  );
                  this.#queueEventTarget.dispatchEvent(
                    new CustomEvent("update", {
                      detail: { id, event: acceptableInput },
                    }),
                  );
                } else {
                  // push back to the queue as there are not enough events
                  this.#queue.push(eventProtocol);
                }
                break;
              }
              case "event": {
                const { event } = eventProtocol;
                if (isPendingEvents.has(event)) {
                  // this event is still processing
                  this.#sendEvent(event);
                } else {
                  if (!enqueuedEvents.has(event)) {
                    controller.enqueue(event);
                    enqueuedEvents.add(event);
                  }
                  const [steps, inputsMap, outputsMap] =
                    this.#getStepFunction(event);
                  const nextEventPromises: Promise<WorkflowEvent<unknown>>[] = [
                    ...steps,
                  ]
                    .map((step) => {
                      const inputs = [...(inputsMap.get(step) ?? [])];
                      const acceptableInputs: WorkflowEvent<unknown>[] =
                        this.#pendingInputQueue.filter((event) =>
                          inputs.some((input) => event instanceof input),
                        );
                      const events: WorkflowEvent<unknown>[] = flattenEvents(
                        inputs,
                        [event, ...acceptableInputs],
                      );
                      // remove the event from the queue, in case of infinite loop
                      events.forEach((event) => {
                        const protocolIdx = this.#queue.findIndex(
                          (protocol) =>
                            protocol.type === "event" &&
                            protocol.event === event,
                        );
                        if (protocolIdx !== -1) {
                          this.#queue.splice(protocolIdx, 1);
                        }
                      });
                      if (events.length !== inputs.length) {
                        if (this.#verbose) {
                          console.log(
                            `Not enough inputs for step ${step.name}, waiting for more events`,
                          );
                        }
                        // not enough to run the step, push back to the queue
                        this.#sendEvent(event);
                        isPendingEvents.add(event);
                        return null;
                      }
                      if (isPendingEvents.has(event)) {
                        isPendingEvents.delete(event);
                      }
                      if (this.#verbose) {
                        console.log(
                          `Running step ${step.name} with inputs ${events}`,
                        );
                      }
                      const data = this.data;
                      return (step as StepHandler<Data>)
                        .call(
                          null,
                          {
                            get data() {
                              return data;
                            },
                            sendEvent: this.#sendEvent,
                            requireEvent: this.#requireEvent,
                          },
                          // @ts-expect-error IDK why
                          ...events.sort((a, b) => {
                            const aIndex = inputs.indexOf(
                              a.constructor as AnyWorkflowEventConstructor,
                            );
                            const bIndex = inputs.indexOf(
                              b.constructor as AnyWorkflowEventConstructor,
                            );
                            return aIndex - bIndex;
                          }),
                        )
                        .then((nextEvent) => {
                          if (this.#verbose) {
                            console.log(
                              `Step ${step.name} completed, next event is ${nextEvent}`,
                            );
                          }
                          const outputs = outputsMap.get(step) ?? [];
                          const outputEvents = flattenEvents(outputs, [
                            nextEvent,
                          ]);
                          if (outputEvents.length !== outputs.length) {
                            if (this.#strict) {
                              const error = Error(
                                `Step ${step.name} returned an unexpected output event ${nextEvent}`,
                              );
                              controller.error(error);
                            } else {
                              console.warn(
                                `Step ${step.name} returned an unexpected output event ${nextEvent}`,
                              );
                            }
                          }
                          if (!(nextEvent instanceof StopEvent)) {
                            this.#pendingInputQueue.unshift(nextEvent);
                            this.#sendEvent(nextEvent);
                          }
                          return nextEvent;
                        });
                    })
                    .filter((promise) => promise !== null);
                  nextEventPromises.forEach((promise) => {
                    pendingTasks.add(promise);
                    promise
                      .catch((err) => {
                        console.error("Error in step", err);
                      })
                      .finally(() => {
                        pendingTasks.delete(promise);
                      });
                  });
                  Promise.race(nextEventPromises)
                    .then((fastestNextEvent) => {
                      if (!enqueuedEvents.has(fastestNextEvent)) {
                        controller.enqueue(fastestNextEvent);
                        enqueuedEvents.add(fastestNextEvent);
                      }
                      return fastestNextEvent;
                    })
                    .then(async (fastestNextEvent) =>
                      Promise.all(nextEventPromises).then((nextEvents) => {
                        for (const nextEvent of nextEvents) {
                          // do not enqueue the same event twice
                          if (fastestNextEvent !== nextEvent) {
                            if (!enqueuedEvents.has(nextEvent)) {
                              controller.enqueue(nextEvent);
                              enqueuedEvents.add(nextEvent);
                            }
                          }
                        }
                      }),
                    )
                    .catch((err) => {
                      controller.error(err);
                    });
                }
                break;
              }
            }
          }
          if (this.#queue.length === 0 && pendingTasks.size === 0) {
            if (this.#verbose) {
              console.log("No more events in the queue");
            }
            break;
          }

          await this.#wait();
        }
        controller.close();
      },
    });
    return stream[Symbol.asyncIterator]();
  }

  with<Initial extends Data>(
    data: Initial,
  ): WorkflowContext<Start, Stop, Initial> {
    return new WorkflowContext({
      startEvent: this.#startEvent,
      wait: this.#wait,
      contextData: data,
      steps: this.#steps,
      timeout: this.#timeout,
      verbose: this.#verbose,
      queue: this.#queue,
      pendingInputQueue: this.#pendingInputQueue,
      resolved: this.#resolved,
      rejected: this.#rejected,
    });
  }

  // PromiseLike implementation, this is following the Promise/A+ spec
  // It will consume the iterator and resolve the promise once it reaches the StopEvent
  // If you want to customize the behavior, you can use the async iterator directly
  #resolved: StopEvent<Stop> | null = null;
  #rejected: Error | null = null;

  async then<TResult1, TResult2 = never>(
    onfulfilled?:
      | ((value: StopEvent<Stop>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ) {
    onfulfilled ??= (value) => value as TResult1;
    onrejected ??= (reason) => {
      throw reason;
    };
    if (this.#resolved !== null) {
      return Promise.resolve(this.#resolved).then(onfulfilled, onrejected);
    } else if (this.#rejected !== null) {
      return Promise.reject(this.#rejected).then(onfulfilled, onrejected);
    }

    if (this.#timeout !== null) {
      const timeout = this.#timeout;
      this.#signal = AbortSignal.timeout(timeout * 1000);
    }

    this.#signal?.addEventListener("abort", () => {
      this.#rejected = new Error(
        `Operation timed out after ${this.#timeout} seconds`,
      );
      onrejected?.(this.#rejected);
    });
    try {
      for await (const event of this.#iteratorSingleton) {
        if (this.#rejected !== null) {
          return onrejected?.(this.#rejected);
        }
        if (event instanceof StartEvent) {
          if (this.#verbose) {
            console.log(`Starting workflow with event ${event}`);
          }
        }
        if (event instanceof StopEvent) {
          if (this.#verbose && this.#pendingInputQueue.length > 0) {
            // fixme: #pendingInputQueue might should be cleanup correctly?
          }
          this.#resolved = event;
          return onfulfilled?.(event);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        this.#rejected = err;
      }
      return onrejected?.(err);
    }
    const nextValue = await this.#iteratorSingleton.next();
    if (nextValue.done === false) {
      this.#rejected = new Error("Workflow did not complete");
      return onrejected?.(this.#rejected);
    }
    return onrejected?.(new Error("UNREACHABLE"));
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
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
    ) as Promise<never>;
  }

  [Symbol.toStringTag]: string = "Context";

  // for worker thread
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
      // value is Subtype of WorkflowEvent
      if (
        typeof value === "object" &&
        value !== null &&
        value?.prototype instanceof WorkflowEvent
      ) {
        return { constructor: value.prototype.constructor.name };
      }
      return value;
    });

    return new TextEncoder().encode(jsonString).buffer;
  }
}
