import type { BaseEvent } from "../internal/type.js";
import type { UUID } from "../types.js";

export type AgentStartEvent = BaseEvent<{
  id: UUID;
}>;
export type AgentEndEvent = BaseEvent<{
  id: UUID;
}>;
