import {
  WorkflowContext,
  type HandlerContext,
  type QueueProtocol,
  type StepHandler,
  type Wait,
} from "./workflow-context.js";
import {
  startEvent,
  stopEvent,
  type StartEvent,
  type StartEventInstance,
  type StopEvent,
  type WorkflowEvent,
} from "./workflow-event.js";

export type StepParameters<
  In extends WorkflowEvent[],
  Out extends WorkflowEvent[],
> = {
  inputs: In;
  outputs: Out;
};

export class Workflow<ContextData, Start, Stop> {
  #steps: Map<
    StepHandler<ContextData, never, never>,
    {
      inputs: WorkflowEvent[];
      outputs: WorkflowEvent[];
    }
  > = new Map();
  #verbose: boolean = false;
  #timeout: number | null = null;
  // fixme: allow microtask
  #nextTick: Wait = () => new Promise((resolve) => setTimeout(resolve, 0));

  constructor(
    params: {
      verbose?: boolean;
      timeout?: number | null;
      wait?: Wait;
    } = {},
  ) {
    if (params.verbose) {
      this.#verbose = params.verbose;
    }
    if (params.timeout) {
      this.#timeout = params.timeout;
    }
    if (params.wait) {
      this.#nextTick = params.wait;
    }
  }

  addStep<
    const In extends [WorkflowEvent | StartEvent, ...WorkflowEvent[]],
    const Out extends (WorkflowEvent | StopEvent)[],
  >(
    parameters: StepParameters<In, Out>,
    stepFn: (
      context: HandlerContext<ContextData>,
      ...events: {
        [K in keyof In]: ReturnType<In[K]>;
      }
    ) => Promise<
      Out extends []
        ? void
        : {
            [K in keyof Out]: ReturnType<Out[K]>;
          }[number]
    >,
  ): this {
    const { inputs, outputs } = parameters;
    this.#steps.set(stepFn as never, { inputs, outputs });
    return this;
  }

  hasStep(stepFn: StepHandler): boolean {
    return this.#steps.has(stepFn);
  }

  removeStep(stepFn: StepHandler): this {
    this.#steps.delete(stepFn);
    return this;
  }

  run(
    event: StartEventInstance<Start> | Start,
  ): unknown extends ContextData
    ? WorkflowContext<Start, Stop, ContextData>
    : WorkflowContext<Start, Stop, ContextData | undefined>;
  run<Data extends ContextData>(
    event: StartEventInstance<Start> | Start,
    data: Data,
  ): WorkflowContext<Start, Stop, Data>;
  run<Data extends ContextData>(
    event: StartEventInstance<Start> | Start,
    data?: Data,
  ): WorkflowContext<Start, Stop, Data> {
    return new WorkflowContext<Start, Stop, Data>({
      startEvent: startEvent.same<Start>(event) ? event : startEvent(event),
      wait: this.#nextTick,
      contextData: data!,
      steps: new Map(this.#steps),
      timeout: this.#timeout,
      verbose: this.#verbose,
      queue: undefined,
      pendingInputQueue: undefined,
      resolved: null,
      rejected: null,
    });
  }

  recover(data: ArrayBuffer): WorkflowContext<Start, Stop, ContextData> {
    const jsonString = new TextDecoder().decode(data);

    const state = JSON.parse(jsonString);

    const reconstructedStartEvent = startEvent(state.startEvent);
    const AllEvents = [...this.#steps]
      .map(([, { inputs, outputs }]) => [...inputs, ...(outputs ?? [])])
      .flat();
    const reconstructedQueue: QueueProtocol[] = state.queue.map(
      (protocol: QueueProtocol): QueueProtocol => {
        switch (protocol.type) {
          case "requestEvent": {
            const { requestEvent, id } = protocol;
            const EventType = AllEvents.find(
              (type) =>
                type.prototype.constructor.name ===
                (requestEvent.constructor as unknown as string),
            );
            if (!EventType) {
              throw new TypeError(
                `Event type not found: ${requestEvent.constructor}`,
              );
            }
            return {
              type: "requestEvent",
              id,
              requestEvent: EventType,
            };
          }
          case "event": {
            const { event } = protocol;
            const EventType = AllEvents.find(
              (type) =>
                type.prototype.constructor.name ===
                (event.constructor as unknown as string),
            );
            if (!EventType) {
              throw new TypeError(`Event type not found: ${event.constructor}`);
            }
            return {
              type: "event",
              event: EventType(event.__data),
            };
          }
        }
      },
    );

    const reconstructedPendingInputQueue = state.pendingInputQueue.map(
      (event: Record<string, unknown>) => {
        const EventType = AllEvents.find(
          (type) => type.prototype.constructor.name === event.constructor,
        );
        if (!EventType) {
          throw new TypeError(`Event type not found: ${event.constructor}`);
        }
        return EventType(event.data);
      },
    );

    return new WorkflowContext<Start, Stop, ContextData>({
      startEvent: reconstructedStartEvent,
      contextData: state.data,
      wait: this.#nextTick,
      steps: this.#steps, // Assuming steps do not change and are part of the class prototype or similar
      timeout: state.timeout,
      verbose: state.verbose,
      queue: reconstructedQueue,
      pendingInputQueue: reconstructedPendingInputQueue,
      resolved: state.resolved ? stopEvent(state.resolved) : null,
      rejected: state.rejected ? new Error(state.rejected) : null,
    });
  }
}
