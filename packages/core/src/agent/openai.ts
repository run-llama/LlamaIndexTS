import { ReadableStream } from "@llamaindex/env";
import type { ChatCompletionChunk } from "openai/resources/chat/completions";
import { Settings } from "../Settings.js";
import { stringifyJSONToMessageContent } from "../internal/utils.js";
import type {
  ChatMessage,
  ChatResponseChunk,
  PartialToolCall,
  ToolCall,
  ToolCallLLMMessageOptions,
  ToolCallOptions,
} from "../llm/index.js";
import { OpenAI } from "../llm/openai.js";
import { ObjectRetriever } from "../objects/index.js";
import type { BaseToolWithCall, ToolOutput } from "../types.js";
import { AgentRunner, AgentWorker, type AgentParamsBase } from "./base.js";
import type { TaskHandler } from "./types.js";
import { callTool } from "./utils.js";

const continuePrompt =
  "Please continue giving input in the next message with the continuation of the JSON.";

type OpenAIParamsBase = AgentParamsBase<OpenAI>;

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
    super({
      llm:
        params.llm ??
        (Settings.llm instanceof OpenAI
          ? (Settings.llm as OpenAI)
          : new OpenAI()),
      chatHistory: params.chatHistory ?? [],
      runner: new OpenAIAgentWorker(),
      systemPrompt: params.systemPrompt ?? null,
      tools:
        "tools" in params
          ? params.tools
          : params.toolRetriever.retrieve.bind(params.toolRetriever),
      verbose: params.verbose ?? false,
    });
  }

  createStore = AgentRunner.defaultCreateStore;

  static taskHandler: TaskHandler<OpenAI> = async (step, enqueueOutput) => {
    const { llm, stream, getTools } = step.context;
    const lastMessage = step.context.store.messages.at(-1)!.content;
    const tools = await getTools(lastMessage);
    const response = await llm.chat({
      // @ts-expect-error
      stream,
      tools,
      messages: [...step.context.store.messages],
    });
    if (!stream) {
      step.context.store.messages = [
        ...step.context.store.messages,
        response.message,
      ];
      const options = response.message.options ?? {};
      enqueueOutput({
        taskStep: step,
        output: response,
        isLast: !("toolCall" in options),
      });
      if ("toolCall" in options) {
        const { toolCall } = options;
        const targetTool = tools.find(
          (tool) => tool.metadata.name === toolCall.name,
        );
        const unfinishedInput =
          response.raw?.choices.at(0)?.finish_reason === "length";
        let toolOutput: ToolOutput;
        if (unfinishedInput) {
          toolOutput = {
            tool: targetTool,
            input: toolCall,
            isError: true,
            output: continuePrompt,
          };
        } else {
          const messages = [...step.context.store.messages].reverse();
          const cutoffIdx = messages.findIndex(
            (message) =>
              message.options &&
              "toolResult" in message.options &&
              message.options.toolResult.result !== continuePrompt,
          );
          let restMessages = messages;
          if (cutoffIdx !== -1) {
            restMessages = messages.slice(0, cutoffIdx);
          }
          restMessages = restMessages.reverse();

          const unfinishedMessages = restMessages.filter(
            (
              message,
              index,
              array,
            ): message is ChatMessage & {
              options: ToolCallOptions;
            } => {
              const prevMessage = array.at(index + 1);
              return (
                prevMessage !== undefined &&
                prevMessage.options !== undefined &&
                "toolResult" in prevMessage.options &&
                prevMessage.options.toolResult.result === continuePrompt &&
                message.options !== undefined &&
                "toolCall" in message.options
              );
            },
          );
          unfinishedMessages.push(step.context.store.messages.at(-1) as any);
          let resultInput: string = "";
          for (let i = 0; i < unfinishedMessages.length - 1; i++) {
            const prevInput = unfinishedMessages[i]!.options.toolCall
              .input as string;
            const nextInput = unfinishedMessages[i + 1].options.toolCall
              .input as string;
            let common = 0;
            while (
              common < prevInput.length &&
              common < nextInput.length &&
              prevInput[common] === nextInput[common]
            ) {
              common++;
            }
            if (resultInput === "") {
              const commonPrefix = prevInput.slice(0, common);
              resultInput += commonPrefix;
            }
            resultInput += prevInput.slice(common) + nextInput.slice(common);
          }
          if (resultInput !== "") {
            toolCall.input = resultInput;
          }
          toolOutput = await callTool(
            targetTool,
            toolCall,
            step.context.logger,
          );
        }
        step.context.store.toolOutputs.push(toolOutput);
        step.context.store.messages = [
          ...step.context.store.messages,
          {
            role: "user" as const,
            content: stringifyJSONToMessageContent(toolOutput.output),
            options: {
              toolResult: {
                result: toolOutput.output,
                isError: toolOutput.isError,
                id: toolCall.id,
              },
            },
          },
        ];
      }
    } else {
      const responseChunkStream = new ReadableStream<
        ChatResponseChunk<ToolCallLLMMessageOptions, ChatCompletionChunk>
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
      enqueueOutput({
        taskStep: step,
        output: finalStream,
        isLast: !hasToolCall,
      });

      if (hasToolCall) {
        // you need to consume the response to get the full toolCalls
        const toolCalls = new Map<string, ToolCall | PartialToolCall>();
        for await (const chunk of pipStream) {
          if (chunk.options && "toolCall" in chunk.options) {
            const toolCall = chunk.options.toolCall;
            toolCalls.set(toolCall.id, toolCall);
          }
          if (chunk.raw?.choices.at(0)?.finish_reason === "length") {
            // todo: how to deal with this case?
            console.warn("tool call response is too long");
          }
        }
        for (const toolCall of toolCalls.values()) {
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
          const toolOutput = await callTool(
            targetTool,
            toolCall,
            step.context.logger,
          );
          step.context.store.messages = [
            ...step.context.store.messages,
            {
              role: "user" as const,
              content: stringifyJSONToMessageContent(toolOutput.output),
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
      }
    }
  };
}
