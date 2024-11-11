import type { WorkflowEvent } from "@llamaindex/workflow";
import * as NewAPI from "@llamaindex/workflow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventTypes<T extends Record<string, any> = any> = new (
  data: T,
) => NewAPI.WorkflowEvent<T>;
type EventTypeParam = EventTypes | EventTypes[];

export type LegacyContext = NewAPI.HandlerContext<{
  get: (key: string, defaultValue?: unknown) => unknown;
  set: (key: string, value: unknown) => void;
  collectEvents: (
    event: WorkflowEvent<unknown>,
    expected: EventTypes[],
  ) => WorkflowEvent<unknown>[] | null;
}>;

type StepFunction = (
  context: LegacyContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: WorkflowEvent<any>,
) => Promise<WorkflowEvent<unknown>>;

export class Workflow {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workflow: NewAPI.Workflow<any, any, any>;

  constructor(
    params: {
      verbose?: boolean;
      timeout?: number;
      validate?: boolean;
    } = {},
  ) {
    this.workflow = new NewAPI.Workflow({
      verbose: params.verbose ?? false,
      timeout: params.timeout ?? null,
    });
  }

  addStep(
    eventType: EventTypeParam,
    method: StepFunction,
    params: { outputs?: EventTypeParam } = {},
  ) {
    this.workflow.addStep(
      {
        // @ts-expect-error - backwards compatibility
        inputs: Array.isArray(eventType) ? eventType : [eventType],
        // @ts-expect-error - backwards compatibility
        outputs: params.outputs
          ? Array.isArray(params.outputs)
            ? params.outputs
            : [params.outputs]
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ([] as any[]),
      },
      method,
    );
  }

  hasStep(step: StepFunction): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.workflow.hasStep(step as any);
  }

  async run<T = string>(
    event: NewAPI.StartEvent<T> | string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<NewAPI.StopEvent<any>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globals: Map<string, any> = new Map();
    const eventBuffer: Map<EventTypes, WorkflowEvent<unknown>[]> = new Map();
    return this.workflow.run(event).with({
      get: (key: string, defaultValue?: unknown) => {
        if (globals.has(key)) {
          return globals.get(key);
        } else if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Key '${key}' not found in Context`);
      },
      set: (key: string, value: unknown) => {
        globals.set(key, value);
      },
      collectEvents(
        event: WorkflowEvent<unknown>,
        expected: EventTypes[],
      ): WorkflowEvent<unknown>[] | null {
        const eventType = event.constructor as EventTypes;
        if (!eventBuffer.has(eventType)) {
          eventBuffer.set(eventType, []);
        }
        eventBuffer.get(eventType)!.push(event);

        const retval: WorkflowEvent<unknown>[] = [];
        for (const expectedType of expected) {
          const events = eventBuffer.get(expectedType);
          if (events && events.length > 0) {
            retval.push(events.shift()!);
          }
        }

        if (retval.length === expected.length) {
          return retval;
        }

        // Put back the events if unable to collect all
        for (const ev of retval) {
          const eventType = ev.constructor as EventTypes;
          if (!eventBuffer.has(eventType)) {
            eventBuffer.set(eventType, []);
          }
          eventBuffer.get(eventType)!.unshift(ev);
        }

        return null;
      },
    });
  }
}
