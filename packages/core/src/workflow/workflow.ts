import { Context, type StepFunction } from "./context";
import { type EventTypes, StartEvent, WorkflowEvent } from "./events";

type EventTypeParam = EventTypes | EventTypes[];

export class Workflow<Start = string> {
  #steps: Map<
    StepFunction<any>,
    { inputs: EventTypes[]; outputs: EventTypes[] | undefined }
  > = new Map();
  #verbose: boolean = false;
  #timeout: number | null = null;

  constructor(
    params: {
      verbose?: boolean;
      timeout?: number;
      validate?: boolean;
    } = {},
  ) {
    this.#verbose = params.verbose ?? false;
    this.#timeout = params.timeout ?? null;
  }

  addStep<T extends WorkflowEvent>(
    eventType: EventTypeParam,
    method: StepFunction<T>,
    params: { outputs?: EventTypeParam } = {},
  ) {
    const inputs = Array.isArray(eventType) ? eventType : [eventType];
    const outputs = params.outputs
      ? Array.isArray(params.outputs)
        ? params.outputs
        : [params.outputs]
      : undefined;
    this.#steps.set(method, { inputs, outputs });
  }

  hasStep(step: StepFunction<any>): boolean {
    return this.#steps.has(step);
  }

  run(event: StartEvent<Start> | Start): Context<Start> {
    const startEvent: StartEvent<Start> =
      event instanceof StartEvent ? event : new StartEvent({ input: event });

    return new Context<Start>({
      startEvent,
      steps: new Map(this.#steps),
      timeout: this.#timeout,
      verbose: this.#verbose,
    });
  }
}
