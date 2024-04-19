import { CustomEvent } from "@llamaindex/env";

export type BaseEvent<Payload extends Record<string, unknown>> = CustomEvent<{
  payload: Payload;
}>;
