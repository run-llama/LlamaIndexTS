import { pipeline, randomUUID } from "@llamaindex/env";
import { Settings } from "../Settings.js";
import { getReACTAgentSystemHeader } from "../internal/prompt/react.js";
import {
  isAsyncIterable,
  stringifyJSONToMessageContent,
} from "../internal/utils.js";
import {
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLM,
} from "../llm/index.js";
import { extractText } from "../llm/utils.js";
import { ObjectRetriever } from "../objects/index.js";
import type {
  BaseTool,
  BaseToolWithCall,
  JSONObject,
  JSONValue,
} from "../types.js";
import {
  AgentRunner,
  AgentWorker,
  type AgentParamsBase,
  type TaskHandler,
} from "./base.js";
import {
  callTool,
  consumeAsyncIterable,
  createReadableStream,
} from "./utils.js";

type ReACTAgentParamsBase = AgentParamsBase<LLM>;

type ReACTAgentParamsWithTools = ReACTAgentParamsBase & {
  tools: BaseToolWithCall[];
};

type ReACTAgentParamsWithToolRetriever = ReACTAgentParamsBase & {
  toolRetriever: ObjectRetriever<BaseToolWithCall>;
};

export type ReACTAgentParams =
  | ReACTAgentParamsWithTools
  | ReACTAgentParamsWithToolRetriever;

type BaseReason = {
  type: unknown;
};

type ObservationReason = BaseReason & {
  type: "observation";
  observation: JSONValue;
};

type ActionReason = BaseReason & {
  type: "action";
  thought: string;
  action: string;
  input: JSONObject;
};

type ResponseReason = BaseReason & {
  type: "response";
  thought: string;
  response: ChatResponse | AsyncIterable<ChatResponseChunk>;
};

type Reason = ObservationReason | ActionReason | ResponseReason;

function reasonFormatter(reason: Reason): string | Promise<string> {
  switch (reason.type) {
    case "observation":
      return `Observation: ${stringifyJSONToMessageContent(reason.observation)}`;
    case "action":
      return `Thought: ${reason.thought}\nAction: ${reason.action}\nInput: ${stringifyJSONToMessageContent(
        reason.input,
      )}`;
    case "response": {
      if (isAsyncIterable(reason.response)) {
        return consumeAsyncIterable(reason.response).then(
          (message) =>
            `Thought: ${reason.thought}\nAnswer: ${extractText(message.content)}`,
        );
      } else {
        return `Thought: ${reason.thought}\nAnswer: ${extractText(
          reason.response.message.content,
        )}`;
      }
    }
  }
}

function extractJsonStr(text: string): string {
  const pattern = /\{.*}/s;
  const match = text.match(pattern);

  if (!match) {
    throw new SyntaxError(`Could not extract json string from output: ${text}`);
  }

  return match[0];
}

function extractFinalResponse(
  inputText: string,
): [thought: string, answer: string] {
  const pattern = /\s*Thought:(.*?)Answer:(.*?)$/s;

  const match = inputText.match(pattern);

  if (!match) {
    throw new Error(
      `Could not extract final answer from input text: ${inputText}`,
    );
  }

  const thought = match[1].trim();
  const answer = match[2].trim();
  return [thought, answer];
}

function extractToolUse(
  inputText: string,
): [thought: string, action: string, input: string] {
  const pattern =
    /\s*Thought: (.*?)\nAction: ([a-zA-Z0-9_]+).*?\.*Input: .*?(\{.*?})/s;

  const match = inputText.match(pattern);

  if (!match) {
    throw new Error(
      `Could not extract tool use from input text: "${inputText}"`,
    );
  }

  const thought = match[1].trim();
  const action = match[2].trim();
  const actionInput = match[3].trim();
  return [thought, action, actionInput];
}

function actionInputParser(jsonStr: string): JSONObject {
  const processedString = jsonStr.replace(/(?<!\w)'|'(?!\w)/g, '"');
  const pattern = /"(\w+)":\s*"([^"]*)"/g;
  const matches = [...processedString.matchAll(pattern)];
  return Object.fromEntries(matches);
}

type ReACTOutputParser = <Options extends object>(
  output: ChatResponse<Options> | AsyncIterable<ChatResponseChunk<Options>>,
) => Promise<Reason>;

const reACTOutputParser: ReACTOutputParser = async (
  output,
): Promise<Reason> => {
  let reason: Reason | null = null;

  if (isAsyncIterable(output)) {
    const [peakStream, finalStream] = createReadableStream(output).tee();
    const type = await pipeline(peakStream, async (iter) => {
      let content = "";
      for await (const chunk of iter) {
        content += chunk.delta;
        if (content.includes("Action:")) {
          return "action";
        } else if (content.includes("Answer:")) {
          return "answer";
        } else if (content.includes("Thought:")) {
          return "thought";
        }
      }
    });
    // step 2: do the parsing from content
    switch (type) {
      case "action": {
        // have to consume the stream to get the full content
        const response = await consumeAsyncIterable(finalStream);
        const { content } = response;
        const [thought, action, input] = extractToolUse(content);
        const jsonStr = extractJsonStr(input);
        let json: JSONObject;
        try {
          json = JSON.parse(jsonStr);
        } catch (e) {
          json = actionInputParser(jsonStr);
        }
        reason = {
          type: "action",
          thought,
          action,
          input: json,
        };
        break;
      }
      case "thought": {
        const thought = "(Implicit) I can answer without any more tools!";
        reason = {
          type: "response",
          thought,
          // bypass the response, because here we don't need to do anything with it
          response: finalStream,
        };
        break;
      }
      case "answer": {
        const response = await consumeAsyncIterable(finalStream);
        const { content } = response;
        const [thought, answer] = extractFinalResponse(content);
        reason = {
          type: "response",
          thought,
          response: {
            raw: response,
            message: {
              role: "assistant",
              content: answer,
            },
          },
        };
        break;
      }
      default: {
        throw new Error(`Invalid type: ${type}`);
      }
    }
  } else {
    const content = extractText(output.message.content);
    const type = content.includes("Answer:")
      ? "answer"
      : content.includes("Action:")
        ? "action"
        : "thought";

    // step 2: do the parsing from content
    switch (type) {
      case "action": {
        const [thought, action, input] = extractToolUse(content);
        const jsonStr = extractJsonStr(input);
        let json: JSONObject;
        try {
          json = JSON.parse(jsonStr);
        } catch (e) {
          json = actionInputParser(jsonStr);
        }
        reason = {
          type: "action",
          thought,
          action,
          input: json,
        };
        break;
      }
      case "thought": {
        const thought = "(Implicit) I can answer without any more tools!";
        reason = {
          type: "response",
          thought,
          response: {
            raw: output,
            message: {
              role: "assistant",
              content: extractText(output.message.content),
            },
          },
        };
        break;
      }
      case "answer": {
        const [thought, answer] = extractFinalResponse(content);
        reason = {
          type: "response",
          thought,
          response: {
            raw: output,
            message: {
              role: "assistant",
              content: answer,
            },
          },
        };
        break;
      }
      default: {
        throw new Error(`Invalid type: ${type}`);
      }
    }
  }
  if (reason === null) {
    throw new TypeError("Reason is null");
  }
  return reason;
};

type ReACTAgentStore = {
  reasons: Reason[];
};

type ChatFormatter = <Options extends object>(
  tools: BaseTool[],
  messages: ChatMessage<Options>[],
  currentReasons: Reason[],
) => Promise<ChatMessage<Options>[]>;

const chatFormatter: ChatFormatter = async <Options extends object>(
  tools: BaseTool[],
  messages: ChatMessage<Options>[],
  currentReasons: Reason[],
): Promise<ChatMessage<Options>[]> => {
  const header = getReACTAgentSystemHeader(tools);
  const reasonMessages: ChatMessage<Options>[] = [];
  for (const reason of currentReasons) {
    const response = await reasonFormatter(reason);
    reasonMessages.push({
      role: reason.type === "observation" ? "user" : "assistant",
      content: response,
    });
  }
  return [
    {
      role: "system",
      content: header,
    },
    ...messages,
    ...reasonMessages,
  ];
};

export class ReACTAgentWorker extends AgentWorker<LLM, ReACTAgentStore> {
  taskHandler = ReACTAgent.taskHandler;
}

export class ReACTAgent extends AgentRunner<LLM, ReACTAgentStore> {
  constructor(
    params: ReACTAgentParamsWithTools | ReACTAgentParamsWithToolRetriever,
  ) {
    super({
      llm: params.llm ?? Settings.llm,
      chatHistory: params.chatHistory ?? [],
      runner: new ReACTAgentWorker(),
      systemPrompt: params.systemPrompt ?? null,
      tools:
        "tools" in params
          ? params.tools
          : params.toolRetriever.retrieve.bind(params.toolRetriever),
    });
  }

  createStore() {
    return {
      reasons: [],
    };
  }

  static taskHandler: TaskHandler<LLM, ReACTAgentStore> = async (step) => {
    const { llm, stream, getTools } = step.context;
    const input = step.input;
    if (input) {
      step.context.store.messages.push(input);
    }
    const lastMessage = step.context.store.messages.at(-1)!.content;
    const tools = await getTools(lastMessage);
    const messages = await chatFormatter(
      tools,
      step.context.store.messages,
      step.context.store.reasons,
    );
    const response = await llm.chat({
      // @ts-expect-error
      stream,
      messages,
    });
    const reason = await reACTOutputParser(response);
    step.context.store.reasons = [...step.context.store.reasons, reason];
    if (reason.type === "response") {
      return {
        isLast: true,
        output: response,
        taskStep: step,
      };
    } else {
      if (reason.type === "action") {
        const tool = tools.find((tool) => tool.metadata.name === reason.action);
        const toolOutput = await callTool(tool, {
          id: randomUUID(),
          input: reason.input,
          name: reason.action,
        });
        step.context.store.reasons = [
          ...step.context.store.reasons,
          {
            type: "observation",
            observation: toolOutput.output,
          },
        ];
      }
      return {
        isLast: false,
        output: null,
        taskStep: step,
      };
    }
  };
}
