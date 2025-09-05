export * from "@llamaindex/workflow-core";
export * from "@llamaindex/workflow-core/middleware/state";
export * from "@llamaindex/workflow-core/stream/run";
export * from "./agent/index.js";
import { zodEvent as coreZodEvent } from "@llamaindex/workflow-core/util/zod";
import type { ZodEvent } from "./agent/function-agent.js";

export const zodEvent = coreZodEvent as (
  ...args: Parameters<typeof coreZodEvent>
) => ZodEvent;
