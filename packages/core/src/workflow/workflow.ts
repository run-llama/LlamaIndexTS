import { Context } from "./context";
import {
  type EventTypes,
  StartEvent,
  StopEvent,
  WorkflowEvent,
} from "./events";

export type StepFunction<T extends WorkflowEvent = WorkflowEvent> = (
  context: Context,
  ev: T,
) => Promise<WorkflowEvent | void>;

type EventTypeParam = EventTypes | EventTypes[];

export class Workflow {
  #steps: Map<
    StepFunction<any>,
    { inputs: EventTypes[]; outputs: EventTypes[] | undefined }
  > = new Map();
  #contexts: Set<Context> = new Set();
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
    this.#timeout = params.timeout ?? null;
    this.#validate = params.validate ?? false;
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

  #acceptsEvent(step: StepFunction<any>, event: WorkflowEvent): boolean {
    const eventType = event.constructor as EventTypes;
    const stepInfo = this.#steps.get(step);
    if (!stepInfo) {
      throw new Error(`No method found for step: ${step.name}`);
    }
    return stepInfo.inputs.includes(eventType);
  }

  async *streamEvents(): AsyncGenerator<WorkflowEvent, void> {
    if (this.#contexts.size > 1) {
      throw new Error(
        "This workflow has multiple concurrent runs in progress and cannot stream events. " +
          "To be able to stream events, make sure you call `run()` on this workflow only once.",
      );
    }

    const context = this.#contexts.values().next().value;
    if (!context) {
      throw new Error("No active context found for streaming events.");
    }

    yield* context.streamEvents();
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

    // Check if there are any unused produced events (except StopEvent)
    const unusedEvents = Array.from(producedEvents).filter(
      (event) => !consumedEvents.has(event) && event !== StopEvent,
    );
    if (unusedEvents.length > 0) {
      const names = unusedEvents.map((event) => event.name).join(", ");
      throw new Error(
        `The following events are produced but never consumed: ${names}`,
      );
    }

    if (this.#verbose) {
      console.log("Workflow validation passed");
    }
  }

  async run<T = string>(event: StartEvent<T> | string): Promise<StopEvent> {
    // Validate the workflow before running if #validate is true
    if (this.#validate) {
      this.validate();
    }

    const context = new Context({ workflow: this, verbose: this.#verbose });
    this.#contexts.add(context);

    const stopWorkflow = () => {
      if (context.running) {
        context.running = false;
        this.#contexts.delete(context);
      }
    };

    const startEvent: WorkflowEvent =
      typeof event === "string" ? new StartEvent({ input: event }) : event;

    if (this.#verbose) {
      console.log(`Starting workflow with event ${startEvent}`);
    }

    const workflowPromise = new Promise<StopEvent>((resolve, reject) => {
      for (const [step] of this.#steps) {
        // send initial event to step
        context.sendEvent(startEvent, step);
        if (this.#verbose) {
          console.log(`Starting tasks for step ${step.name}`);
        }
        queueMicrotask(async () => {
          try {
            while (context.running) {
              const currentEvent = context.getNextEvent(step);
              if (!currentEvent) {
                // if there's no event, wait and try again
                await new Promise((resolve) => setTimeout(resolve, 0));
                continue;
              }
              if (!this.#acceptsEvent(step, currentEvent)) {
                // step does not accept current event, skip it
                continue;
              }
              if (this.#verbose) {
                console.log(`Step ${step.name} received event ${currentEvent}`);
              }
              const result = await step.call(this, context, currentEvent);
              if (!context.running) {
                // workflow was stopped during the execution (e.g. there was a timeout)
                return;
              }
              if (result instanceof StopEvent) {
                if (this.#verbose) {
                  console.log(`Stopping workflow with event ${result}`);
                }
                resolve(result);
                return;
              }
              if (result instanceof WorkflowEvent) {
                context.sendEvent(result);
              }
            }
          } catch (error) {
            if (this.#verbose) {
              console.error(`Error in calling step ${step.name}:`, error);
            }
            reject(error as Error);
          } finally {
            stopWorkflow();
          }
        });
      }
    });

    if (this.#timeout !== null) {
      const timeout = this.#timeout;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          stopWorkflow();
          reject(new Error(`Operation timed out after ${timeout} seconds`));
        }, timeout * 1000),
      );
      return Promise.race([workflowPromise, timeoutPromise]);
    }

    return workflowPromise;
  }
}
