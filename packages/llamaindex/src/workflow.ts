import { Workflow as OriginalWorkflow } from "@llamaindex/workflow";
export * from "@llamaindex/workflow";

/**
 * @deprecated The Workflow class is deprecated. Please import directly from "@llamaindex/workflow" in the future.
 */
export class Workflow<ContextData, Start, Stop> extends OriginalWorkflow<
  ContextData,
  Start,
  Stop
> {
  constructor(...args: any[]) {
    // Need to figure out the constructor args for Workflow
    console.warn(
      "The Workflow class exported from 'llamaindex' is deprecated. Please use workflows directly from '@llamaindex/workflow' in the future. See https://ts.llamaindex.ai/docs/llamaindex/modules/agents/workflows for usage.",
    );
    super(...args);
  }
}
