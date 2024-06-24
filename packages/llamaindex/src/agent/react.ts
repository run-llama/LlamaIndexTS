import { randomUUID, ReadableStream } from "@llamaindex/env";
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
import { Settings } from "../Settings.js";
import type {
  BaseTool,
  BaseToolWithCall,
  JSONObject,
  JSONValue,
} from "../types.js";
import { AgentRunner, AgentWorker, type AgentParamsBase } from "./base.js";
import type { TaskHandler } from "./types.js";
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
  response: ChatResponse;
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
      return `Thought: ${reason.thought}\nAnswer: ${extractText(
        reason.response.message.content,
      )}`;
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
  onResolveType: (
    type: "action" | "thought" | "answer",
    response:
      | ChatResponse<Options>
      | ReadableStream<ChatResponseChunk<Options>>,
  ) => void,
) => Promise<Reason>;

const reACTOutputParser: ReACTOutputParser = async (
  output,
  onResolveType,
): Promise<Reason> => {
  let reason: Reason | null = null;

  if (isAsyncIterable(output)) {
    const [peakStream, finalStream] = createReadableStream(output).tee();
    const reader = peakStream.getReader();
    let type: "action" | "thought" | "answer" | null = null;
    let content = "";
    do {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      content += value.delta;
      if (content.includes("Action:")) {
        type = "action";
      } else if (content.includes("Answer:")) {
        type = "answer";
      }
    } while (true);
    if (type === null) {
      // `Thought:` is always present at the beginning of the output.
      type = "thought";
    }
    reader.releaseLock();
    if (!type) {
      throw new Error("Could not determine type of output");
    }
    onResolveType(type, finalStream);
    // step 2: do the parsing from content
    switch (type) {
      case "action": {
        // have to consume the stream to get the full content
        const response = await consumeAsyncIterable(peakStream, content);
        const [thought, action, input] = extractToolUse(response.content);
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
        const response = await consumeAsyncIterable(peakStream, content);
        reason = {
          type: "response",
          thought,
          response: {
            raw: peakStream,
            message: response,
          },
        };
        break;
      }
      case "answer": {
        const response = await consumeAsyncIterable(peakStream, content);
        const [thought, answer] = extractFinalResponse(response.content);
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
        : // `Thought:` is always present at the beginning of the output.
          "thought";
    onResolveType(type, output);

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
  taskHandler = ReActAgent.taskHandler;
}

export class ReActAgent extends AgentRunner<LLM, ReACTAgentStore> {
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
      verbose: params.verbose ?? false,
    });
  }

  createStore() {
    return {
      reasons: [],
    };
  }

  static taskHandler: TaskHandler<LLM, ReACTAgentStore> = async (
    step,
    enqueueOutput,
  ) => {
    const { llm, stream, getTools } = step.context;
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
    const reason = await reACTOutputParser(response, (type, response) => {
      enqueueOutput({
        taskStep: step,
        output: response,
        isLast: type !== "action",
      });
    });
    step.context.logger.log("current reason: %O", reason);
    step.context.store.reasons = [...step.context.store.reasons, reason];
    if (reason.type === "action") {
      const tool = tools.find((tool) => tool.metadata.name === reason.action);
      const toolOutput = await callTool(
        tool,
        {
          id: randomUUID(),
          input: reason.input,
          name: reason.action,
        },
        step.context.logger,
      );
      step.context.store.reasons = [
        ...step.context.store.reasons,
        {
          type: "observation",
          observation: toolOutput.output,
        },
      ];
    }
  };
}
