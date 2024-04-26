import type { BaseEvent } from "../internal/type.js";
import type { TaskStep } from "./base.js";

export type AgentStartEvent = BaseEvent<{
  startStep: TaskStep;
}>;
export type AgentEndEvent = BaseEvent<{
  endStep: TaskStep;
}>;
