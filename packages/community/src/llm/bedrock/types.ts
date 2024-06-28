type Usage = {
  input_tokens: number;
  output_tokens: number;
};

type Message = {
  id: string;
  type: string;
  role: string;
  content: string[];
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: Usage;
};

export type ToolBlock = {
  id: string;
  input: unknown;
  name: string;
  type: "tool_use";
};

export type TextBlock = {
  type: "text";
  text: string;
};

type ContentBlockStart = {
  type: "content_block_start";
  index: number;
  content_block: ToolBlock | TextBlock;
};

type Delta =
  | {
      type: "text_delta";
      text: string;
    }
  | {
      type: "input_json_delta";
      partial_json: string;
    };

type ContentBlockDelta = {
  type: "content_block_delta";
  index: number;
  delta: Delta;
};

type ContentBlockStop = {
  type: "content_block_stop";
  index: number;
};

type MessageDelta = {
  type: "message_delta";
  delta: {
    stop_reason: string;
    stop_sequence: string | null;
  };
  usage: Usage;
};

type InvocationMetrics = {
  inputTokenCount: number;
  outputTokenCount: number;
  invocationLatency: number;
  firstByteLatency: number;
};

type MessageStop = {
  type: "message_stop";
  "amazon-bedrock-invocationMetrics": InvocationMetrics;
};

export type ToolChoice =
  | { type: "any" }
  | { type: "auto" }
  | { type: "tool"; name: string };

export type AnthropicStreamEvent =
  | { type: "message_start"; message: Message }
  | ContentBlockStart
  | ContentBlockDelta
  | ContentBlockStop
  | MessageDelta
  | MessageStop;

export type AnthropicContent =
  | AnthropicTextContent
  | AnthropicImageContent
  | AnthropicToolContent
  | AnthropicToolResultContent;

export type MetaTextContent = string;

export type AnthropicTextContent = {
  type: "text";
  text: string;
};

export type AnthropicToolContent = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

export type AnthropicToolResultContent = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};

export type AnthropicMediaTypes =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

export type AnthropicImageSource = {
  type: "base64";
  media_type: AnthropicMediaTypes;
  data: string; // base64 encoded image bytes
};

export type AnthropicImageContent = {
  type: "image";
  source: AnthropicImageSource;
};

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: AnthropicContent[];
};

export type MetaMessage = {
  role: "user" | "assistant" | "system";
  content: MetaTextContent;
};

export type AnthropicNoneStreamingResponse = {
  id: string;
  type: "message";
  role: "assistant";
  content: AnthropicContent[];
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence";
  stop_sequence?: string;
  usage: { input_tokens: number; output_tokens: number };
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
