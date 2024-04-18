import { pipeline } from "@llamaindex/env";
import { Settings } from "../Settings.js";
import type {
  ChatMessage,
  ChatResponseChunk,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "../llm/index.js";
import { OpenAI } from "../llm/open_ai.js";
import { ObjectRetriever } from "../objects/index.js";
import type { BaseToolWithCall } from "../types.js";
import { AgentRunner, AgentWorker, type TaskHandler } from "./base.js";
import { callTool } from "./utils.js";

type OpenAIParamsBase = {
  llm?: OpenAI;
  chatHistory?: ChatMessage<ToolCallLLMMessageOptions>[];
};

type OpenAIParamsWithTools = OpenAIParamsBase & {
  tools: BaseToolWithCall[];
};

type OpenAIParamsWithToolRetriever = OpenAIParamsBase & {
  toolRetriever: ObjectRetriever<BaseToolWithCall>;
};

export type OpenAIAgentParams =
  | OpenAIParamsWithTools
  | OpenAIParamsWithToolRetriever;

export class OpenAIAgentWorker extends AgentWorker<OpenAI> {
  taskHandler = OpenAIAgent.taskHandler;
}

export class OpenAIAgent extends AgentRunner<OpenAI> {
  constructor(params: OpenAIAgentParams) {
    super(
      params.llm ?? Settings.llm instanceof OpenAI
        ? (Settings.llm as OpenAI)
        : new OpenAI(),
      params.chatHistory ?? [],
      new OpenAIAgentWorker(),
      "tools" in params
        ? params.tools
        : params.toolRetriever.retrieve.bind(params.toolRetriever),
    );
  }

  createStore = AgentRunner.defaultCreateStore;

  static taskHandler: TaskHandler<OpenAI> = async (step) => {
    const { input } = step;
    const { llm, tools, stream } = step.context;
    if (input) {
      step.context.store.messages = [...step.context.store.messages, input];
    }
    const response = await llm.chat({
      // @ts-expect-error
      stream,
      tools,
      messages: step.context.store.messages,
    });
    if (!stream) {
      step.context.store.messages = [
        ...step.context.store.messages,
        response.message,
      ];
      const options = response.message.options ?? {};
      if ("toolCall" in options) {
        const { toolCall } = options;
        const targetTool = tools.find(
          (tool) => tool.metadata.name === toolCall.name,
        );
        const toolOutput = await callTool(targetTool, toolCall);
        step.context.store.toolOutputs.push(toolOutput);
        return {
          taskStep: step,
          output: {
            raw: response.raw,
            message: {
              content: toolOutput.output,
              role: "user",
              options: {
                toolResult: {
                  result: toolOutput.output,
                  isError: toolOutput.isError,
                  id: toolCall.id,
                },
              },
            },
          },
          isLast: false,
        };
      } else {
        return {
          taskStep: step,
          output: response,
          isLast: true,
        };
      }
    } else {
      const responseChunkStream = new ReadableStream<
        ChatResponseChunk<ToolCallLLMMessageOptions>
      >({
        async start(controller) {
          for await (const chunk of response) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      });
      const [pipStream, finalStream] = responseChunkStream.tee();
      const reader = pipStream.getReader();
      const { value } = await reader.read();
      reader.releaseLock();
      if (value === undefined) {
        throw new Error(
          "first chunk value is undefined, this should not happen",
        );
      }
      // check if first chunk has tool calls, if so, this is a function call
      // otherwise, it's a regular message
      const hasToolCall = !!(value.options && "toolCall" in value.options);

      if (hasToolCall) {
        // you need to consume the response to get the full toolCalls
        const toolCalls = await pipeline(
          pipStream,
          async (
            iter: AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>,
          ) => {
            const toolCalls = new Map<string, ToolCall>();
            for await (const chunk of iter) {
              if (chunk.options && "toolCall" in chunk.options) {
                const toolCall = chunk.options.toolCall;
                toolCalls.set(toolCall.id, toolCall);
              }
            }
            return [...toolCalls.values()];
          },
        );
        for (const toolCall of toolCalls) {
          const targetTool = tools.find(
            (tool) => tool.metadata.name === toolCall.name,
          );
          step.context.store.messages = [
            ...step.context.store.messages,
            {
              role: "assistant" as const,
              content: "",
              options: {
                toolCall,
              },
            },
          ];
          const toolOutput = await callTool(targetTool, toolCall);
          step.context.store.messages = [
            ...step.context.store.messages,
            {
              role: "user" as const,
              content: toolOutput.output,
              options: {
                toolResult: {
                  result: toolOutput.output,
                  isError: toolOutput.isError,
                  id: toolCall.id,
                },
              },
            },
          ];
          step.context.store.toolOutputs.push(toolOutput);
        }
        return {
          taskStep: step,
          output: null,
          isLast: false,
        };
      } else {
        return {
          taskStep: step,
          output: finalStream,
          isLast: true,
        };
      }
    }
  };
}
