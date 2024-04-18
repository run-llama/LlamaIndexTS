type AgentBaseEvent<Payload extends Record<string, unknown>> = CustomEvent<{
  payload: Payload;
}>;

export type AgentStartEvent = AgentBaseEvent<{}>;
export type AgentEndEvent = AgentBaseEvent<{}>;
