import type { InvocationMetrics } from "../types";

export type MetaTextContent = string;

export type MetaMessage = {
  role: "user" | "assistant" | "system";
  content: MetaTextContent;
};

type MetaResponse = {
  generation: string;
  prompt_token_count: number;
  generation_token_count: number;
  stop_reason: "stop" | "length";
};

export type MetaStreamEvent = MetaResponse & {
  "amazon-bedrock-invocationMetrics": InvocationMetrics;
};

export type MetaNoneStreamingResponse = MetaResponse;
