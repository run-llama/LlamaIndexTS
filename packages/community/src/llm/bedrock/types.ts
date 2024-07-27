export type InvocationMetrics = {
  inputTokenCount: number;
  outputTokenCount: number;
  invocationLatency: number;
  firstByteLatency: number;
};

export type ToolChoice =
  | { type: "any" }
  | { type: "auto" }
  | { type: "tool"; name: string };
