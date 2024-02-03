export type OpenAIToolCall = ChatCompletionMessageToolCall;

export interface Function {
  arguments: string;
  name: string;
  type: "function";
}

export interface ChatCompletionMessageToolCall {
  id: string;
  function: Function;
  type: "function";
}
