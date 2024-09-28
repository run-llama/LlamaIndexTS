import { type StepFunction, WorkflowContext } from "./context";
import {
  type EventTypes,
  StartEvent,
  StopEvent,
  WorkflowEvent,
} from "./events";

type EventTypeParam = EventTypes | EventTypes[];

export class Workflow<
  Start = string,
  Stop = string,
  ContextData = any,
  Checked = false,
> {
  #steps: Map<
    StepFunction<any>,
    { inputs: EventTypes[]; outputs: EventTypes[] | undefined }
  > = new Map();
  #verbose: boolean = false;
  #timeout: number | null = null;
  #contextData: true extends Checked ? ContextData : ContextData | null = null!;

  constructor(
    params: {
      verbose?: boolean;
      timeout?: number | null;
    } = {},
  ) {
    this.#verbose = params.verbose ?? false;
    this.#timeout = params.timeout ?? null;
  }

  addStep<
    const In extends
      | (typeof WorkflowEvent<any>)[]
      | typeof WorkflowEvent<any>
      | typeof StartEvent<Start>,
    Out extends WorkflowEvent | StopEvent<Stop>,
  >(
    inputEvents: In,
    stepFn: StepFunction<
      true extends Checked ? ContextData : ContextData | null,
      // special case for StartEvent, typescript doesn't accept default value for generic type when bypassing it
      // Refs: https://github.com/microsoft/TypeScript/issues/42064
      In extends typeof StartEvent<string>
        ? [typeof StartEvent<string>]
        : In extends typeof WorkflowEvent<any>
          ? [In]
          : In,
      Out
    >,
    params: { outputs?: EventTypeParam } = {},
  ): this {
    const inputs: (typeof WorkflowEvent)[] = Array.isArray(inputEvents)
      ? inputEvents
      : [inputEvents];
    const outputs = params.outputs
      ? Array.isArray(params.outputs)
        ? params.outputs
        : [params.outputs]
      : undefined;
    this.#steps.set(stepFn, { inputs, outputs });
    return this;
  }

  removeStep(stepFn: StepFunction<any>): this {
    this.#steps.delete(stepFn);
    return this;
  }

  run(
    event: StartEvent<Start> | Start,
  ): WorkflowContext<
    Start,
    Stop,
    true extends Checked ? ContextData : ContextData | null
  > {
    const startEvent: StartEvent<Start> =
      event instanceof StartEvent ? event : new StartEvent({ input: event });

    return new WorkflowContext<
      Start,
      Stop,
      true extends Checked ? ContextData : ContextData | null
    >({
      startEvent,
      contextData: this.#contextData,
      steps: new Map(this.#steps),
      timeout: this.#timeout,
      verbose: this.#verbose,
    });
  }

  // This method is used to create a new instance of Workflow with the same steps
  // though this API we follow functional programming principles
  private static from<Start, Stop, ContextData, Checked>(
    workflow: Workflow<Start, Stop, ContextData, Checked>,
  ): Workflow<Start, Stop, ContextData, Checked> {
    const newWorkflow = new Workflow<Start, Stop, ContextData, Checked>({
      verbose: workflow.#verbose,
      timeout: workflow.#timeout,
    });
    workflow.#steps.forEach((value, key) => {
      newWorkflow.#steps.set(key, {
        inputs: [...value.inputs],
        outputs: value.outputs ? [...value.outputs] : undefined,
      });
    });
    return newWorkflow;
  }

  with<Data extends ContextData>(
    data: Data,
  ): Workflow<Start, Stop, Data, true> {
    const newWorkflow = Workflow.from<Start, Stop, ContextData, Checked>(this);
    newWorkflow.#contextData = data as Data;
    return newWorkflow as unknown as Workflow<Start, Stop, Data, true>;
  }
}
