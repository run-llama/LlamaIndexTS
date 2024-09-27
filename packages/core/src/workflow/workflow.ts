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
  #validate: boolean = false;

  constructor(
    params: {
      verbose?: boolean;
      timeout?: number;
      validate?: boolean;
    } = {},
  ) {
    this.#verbose = params.verbose ?? false;
    this.#validate = params.validate ?? false;
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

  validate(): void {
    if (this.#verbose) {
      console.log("Validating workflow...");
    }

    // Check if all steps have outputs defined
    // precondition for the validation to work
    const allStepsHaveOutputs = Array.from(this.#steps.values()).every(
      (stepInfo) => stepInfo.outputs !== undefined,
    );
    if (!allStepsHaveOutputs) {
      throw new Error(
        "Not all steps have outputs defined. Can't validate. Add the 'outputs' parameter to each 'addStep' method call to do validation",
      );
    }

    // input events that are consumed by any step of the workflow
    const consumedEvents: Set<EventTypes> = new Set();
    // output events that are produced by any step of the workflow
    const producedEvents: Set<EventTypes> = new Set([StartEvent]);

    for (const [, stepInfo] of this.#steps) {
      stepInfo.inputs.forEach((eventType) => consumedEvents.add(eventType));
      stepInfo.outputs?.forEach((eventType) => producedEvents.add(eventType));
    }

    // Check if all consumed events are produced
    const unconsumedEvents = Array.from(consumedEvents).filter(
      (event) => !producedEvents.has(event),
    );
    if (unconsumedEvents.length > 0) {
      const names = unconsumedEvents.map((event) => event.name).join(", ");
      throw new Error(
        `The following events are consumed but never produced: ${names}`,
      );
    }
  }

  run(event: StartEvent<Start> | Start): Context<Start> {
    if (this.#validate) {
      this.validate();
    }

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
