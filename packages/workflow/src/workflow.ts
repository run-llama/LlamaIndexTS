import {
  WorkflowContext,
  type HandlerContext,
  type QueueProtocol,
  type StepHandler,
  type Wait,
} from "./workflow-context.js";
import {
  StartEvent,
  StopEvent,
  type AnyWorkflowEventConstructor,
  type StartEventConstructor,
  type StopEventConstructor,
} from "./workflow-event.js";

export type StepParameters<
  In extends AnyWorkflowEventConstructor[],
  Out extends AnyWorkflowEventConstructor[],
> = {
  inputs: In;
  outputs: Out;
};

export class Workflow<ContextData, Start, Stop> {
  #steps: Map<
    StepHandler<ContextData, never, never>,
    {
      inputs: AnyWorkflowEventConstructor[];
      outputs: AnyWorkflowEventConstructor[];
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
    const In extends [
      AnyWorkflowEventConstructor | StartEventConstructor,
      ...(AnyWorkflowEventConstructor | StopEventConstructor)[],
    ],
    const Out extends [
      AnyWorkflowEventConstructor | StopEventConstructor,
      ...(AnyWorkflowEventConstructor | StopEventConstructor)[],
    ],
  >(
    parameters: StepParameters<In, Out>,
    stepFn: (
      context: HandlerContext<ContextData>,
      ...events: {
        [K in keyof In]: InstanceType<In[K]>;
      }
    ) => Promise<
      {
        [K in keyof Out]: InstanceType<Out[K]>;
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
    event: StartEvent<Start> | Start,
  ): unknown extends ContextData
    ? WorkflowContext<Start, Stop, ContextData>
    : WorkflowContext<Start, Stop, ContextData | undefined>;
  run<Data extends ContextData>(
    event: StartEvent<Start> | Start,
    data: Data,
  ): WorkflowContext<Start, Stop, Data>;
  run<Data extends ContextData>(
    event: StartEvent<Start> | Start,
    data?: Data,
  ): WorkflowContext<Start, Stop, Data> {
    const startEvent: StartEvent<Start> =
      event instanceof StartEvent ? event : new StartEvent(event);

    return new WorkflowContext<Start, Stop, Data>({
      startEvent,
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

    const reconstructedStartEvent = new StartEvent<Start>(state.startEvent);
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
              event: new EventType(event.data),
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
        return new EventType(event.data);
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
      resolved: state.resolved ? new StopEvent<Stop>(state.resolved) : null,
      rejected: state.rejected ? new Error(state.rejected) : null,
    });
  }
}
