import {
  WorkflowContext,
  type HandlerContext,
  type StepHandler,
  type Wait,
} from "./workflow-context.js";
import {
  StartEvent,
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
}
