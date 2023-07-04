import {
  ChatCompletionRequestMessageRoleEnum,
  CreateChatCompletionRequest,
  OpenAISession,
  getOpenAISession,
} from "./openai";

export interface BaseLanguageModel {}

type MessageType = "human" | "ai" | "system" | "generic" | "function";

interface BaseMessage {
  content: string;
  type: MessageType;
}

interface Generation {
  text: string;
  generationInfo?: Record<string, any>;
}

interface StreamResponse {
  response?: string;
  isDone: boolean;
  index: number;
}

export interface LLMResult {
  generations: Generation[][]; // Each input can have more than one generations
}

export class BaseChatModel implements BaseLanguageModel {}

export class ChatOpenAI extends BaseChatModel {
  model: string;
  temperature: number = 0.7;
  openAIKey: string | null = null;
  requestTimeout: number | null = null;
  maxRetries: number = 6;
  n: number = 1;
  maxTokens?: number;
  session: OpenAISession;
  onStreamCallback?: (data: StreamResponse) => void;

  constructor(model: string = "gpt-3.5-turbo") {
    super();
    this.model = model;
    this.session = getOpenAISession();
  }

  static mapMessageType(
    type: MessageType
  ): ChatCompletionRequestMessageRoleEnum {
    switch (type) {
      case "human":
        return "user";
      case "ai":
        return "assistant";
      case "system":
        return "system";
      case "function":
        return "function";
      default:
        return "user";
    }
  }

  async agenerate(messages: BaseMessage[]): Promise<LLMResult> {
    console.log("CALLED GENERATOR");
    const baseRequestParams: CreateChatCompletionRequest = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      n: this.n,
      messages: messages.map((message) => ({
        role: ChatOpenAI.mapMessageType(message.type),
        content: message.content,
      })),
    };

    // TODO: handle streaming, this is a test
    this.onStreamCallback = (x) => {
      console.log("stream callback: ", x);
    };

    if (this.onStreamCallback) {
      const response = await this.session.openai.createChatCompletion(
        {
          ...baseRequestParams,
          stream: Boolean(this.onStreamCallback),
        },
        { responseType: "stream" }
      );
      const content = await __ahandleStreaming({
        stream: __astreamCompletion(
          response.data as any,
          '"finish_reason":"stop"'
        ),
        onStreamCallback: this.onStreamCallback,
      });
      return { generations: [[{ text: content }]] };
    }

    const response = await this.session.openai.createChatCompletion(
      baseRequestParams
    );

    const { data } = response;
    const content = data.choices[0].message?.content ?? "";
    return { generations: [[{ text: content }]] };
  }
}

async function __ahandleStreaming({
  stream,
  onStreamCallback,
}: {
  stream: any;
  onStreamCallback: (data: StreamResponse) => void;
}): Promise<string> {
  let index = 0;
  let cumulativeText = "";
  for await (const message of stream) {
    const response = JSON.parse(message);
    console.log("response: ", response);
    const { delta } = response?.choices[0] || {};
    const text = delta?.content ?? "";
    cumulativeText += text;
    onStreamCallback?.({ response, index, isDone: false });
    index++;
  }
  onStreamCallback?.({ index, isDone: true });
  return cumulativeText;
}

async function* __astreamCompletion(data: string[], eolString: string) {
  yield* __alinesToMessages(__achunksToLines(data, eolString));
}

async function* __alinesToMessages(linesAsync: string | void | any) {
  for await (const line of linesAsync) {
    const message = line.substring("data :".length);

    yield message;
  }
}

async function* __achunksToLines(chunksAsync: string[], eolString: string) {
  let previous = "";
  for await (const chunk of chunksAsync) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    previous += bufferChunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf("\n")) >= 0) {
      // line includes the EOL
      const line = previous.slice(0, eolIndex + 1).trimEnd();
      if (line.includes(eolString)) {
        break;
      }

      if (line.startsWith("data: ")) {
        yield line;
      }
      previous = previous.slice(eolIndex + 1);
    }
  }
}
