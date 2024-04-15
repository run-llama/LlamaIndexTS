import { pipeline, randomUUID } from "@llamaindex/env";
import type { ChatCompletionToolChoiceOption } from "openai/resources/chat/completions";
import { Response } from "../../Response.js";
import { Settings } from "../../Settings.js";
import {
  AgentChatResponse,
  ChatResponseMode,
  StreamingAgentChatResponse,
} from "../../engines/chat/types.js";
import {
  OpenAI,
  isFunctionCallingModel,
  type ChatMessage,
  type ChatResponseChunk,
  type LLMChatParamsBase,
  type OpenAIAdditionalChatOptions,
  type OpenAIAdditionalMessageOptions,
} from "../../llm/index.js";
import { extractText } from "../../llm/utils.js";
import { ChatMemoryBuffer } from "../../memory/ChatMemoryBuffer.js";
import type { ObjectRetriever } from "../../objects/base.js";
import type { ToolOutput } from "../../tools/types.js";
import { callToolWithErrorHandling } from "../../tools/utils.js";
import type { BaseTool } from "../../types.js";
import type { AgentWorker, Task } from "../types.js";
import { TaskStep, TaskStepOutput } from "../types.js";
import { addUserStepToMemory, getFunctionByName } from "../utils.js";
import type { OpenAIToolCall } from "./types/chat.js";

async function callFunction(
  tools: BaseTool[],
  toolCall: OpenAIToolCall,
): Promise<[ChatMessage, ToolOutput]> {
  const id_ = toolCall.id;
  const functionCall = toolCall.function;
  const name = toolCall.function.name;
  const argumentsStr = toolCall.function.arguments;

  if (Settings.debug) {
    console.log("=== Calling Function ===");
    console.log(`Calling function: ${name} with args: ${argumentsStr}`);
  }

  const tool = getFunctionByName(tools, name);
  const argumentDict = JSON.parse(argumentsStr);

  // Call tool
  // Use default error message
  const output = await callToolWithErrorHandling(tool, argumentDict);

  if (Settings.debug) {
    console.log(`Got output ${output}`);
    console.log("==========================");
  }

  return [
    {
      content: `${output}`,
      role: "tool",
      options: {
        name,
        tool_call_id: id_,
      },
    },
    output,
  ];
}

type OpenAIAgentWorkerParams = {
  tools?: BaseTool[];
  llm?: OpenAI;
  prefixMessages?: ChatMessage[];
  maxFunctionCalls?: number;
  toolRetriever?: ObjectRetriever;
};

type CallFunctionOutput = {
  message: ChatMessage;
  toolOutput: ToolOutput;
};

export class OpenAIAgentWorker
  implements AgentWorker<LLMChatParamsBase<OpenAIAdditionalChatOptions>>
{
  private llm: OpenAI;
  private maxFunctionCalls: number = 5;

  public prefixMessages: ChatMessage[];

  private _getTools: (input: string) => Promise<BaseTool[]>;

  constructor({
    tools = [],
    llm,
    prefixMessages,
    maxFunctionCalls,
    toolRetriever,
  }: OpenAIAgentWorkerParams) {
    this.llm =
      llm ?? isFunctionCallingModel(Settings.llm)
        ? (Settings.llm as OpenAI)
        : new OpenAI({
            model: "gpt-3.5-turbo-0613",
          });
    if (maxFunctionCalls) {
      this.maxFunctionCalls = maxFunctionCalls;
    }
    this.prefixMessages = prefixMessages || [];

    if (tools.length > 0 && toolRetriever) {
      throw new Error("Cannot specify both tools and tool_retriever");
    } else if (tools.length > 0) {
      this._getTools = async () => tools;
    } else if (toolRetriever) {
      // fixme: this won't work, type mismatch
      this._getTools = async (message: string) =>
        toolRetriever.retrieve(message);
    } else {
      this._getTools = async () => [];
    }
  }

  public getAllMessages(task: Task): ChatMessage[] {
    return [
      ...this.prefixMessages,
      ...task.memory.get(),
      ...task.extraState.newMemory.get(),
    ];
  }

  public getLatestToolCalls(task: Task): OpenAIToolCall[] | null {
    const chatHistory: ChatMessage[] = task.extraState.newMemory.getAll();

    if (chatHistory.length === 0) {
      return null;
    }

    // fixme
    return chatHistory[chatHistory.length - 1].options?.toolCalls as any;
  }

  private _getLlmChatParams(
    task: Task,
    openaiTools: BaseTool[],
    toolChoice: ChatCompletionToolChoiceOption = "auto",
  ): LLMChatParamsBase<OpenAIAdditionalChatOptions> {
    const llmChatParams = {
      messages: this.getAllMessages(task),
      tools: undefined as BaseTool[] | undefined,
      additionalChatOptions: {} as OpenAIAdditionalChatOptions,
    } satisfies LLMChatParamsBase<OpenAIAdditionalChatOptions>;

    if (openaiTools.length > 0) {
      llmChatParams.tools = openaiTools;
      llmChatParams.additionalChatOptions.tool_choice = toolChoice;
    }

    return llmChatParams;
  }

  private _processMessage(
    task: Task,
    aiMessage: ChatMessage,
  ): AgentChatResponse {
    task.extraState.newMemory.put(aiMessage);

    return new AgentChatResponse(
      extractText(aiMessage.content),
      task.extraState.sources,
    );
  }

  private async _getStreamAiResponse(
    task: Task,
    llmChatParams: LLMChatParamsBase<OpenAIAdditionalChatOptions>,
  ): Promise<StreamingAgentChatResponse | AgentChatResponse> {
    const stream = await this.llm.chat({
      stream: true,
      ...llmChatParams,
    });

    const responseChunkStream = new ReadableStream<
      ChatResponseChunk<OpenAIAdditionalMessageOptions>
    >({
      async start(controller) {
        for await (const chunk of stream) {
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
      throw new Error("first chunk value is undefined, this should not happen");
    }
    // check if first chunk has tool calls, if so, this is a function call
    // otherwise, it's a regular message
    const hasToolCalls: boolean =
      !!value.options?.toolCalls?.length &&
      value.options?.toolCalls?.length > 0;

    if (hasToolCalls) {
      return this._processMessage(task, {
        content: await pipeline(finalStream, async (iterator) => {
          let content = "";
          for await (const value of iterator) {
            content += value.delta;
          }
          return content;
        }),
        role: "assistant",
        options: value.options,
      });
    } else {
      const [responseStream, chunkStream] = finalStream.tee();
      let content = "";
      return new StreamingAgentChatResponse(
        responseStream.pipeThrough<Response>({
          readable: new ReadableStream({
            async start(controller) {
              for await (const chunk of chunkStream) {
                controller.enqueue(new Response(chunk.delta));
              }
              controller.close();
            },
          }),
          writable: new WritableStream({
            write(chunk) {
              content += chunk.delta;
            },
            close() {
              task.extraState.newMemory.put({
                content,
                role: "assistant",
              });
            },
          }),
        }),
        task.extraState.sources,
      );
    }
  }

  private async _getAgentResponse(
    task: Task,
    mode: ChatResponseMode,
    llmChatParams: LLMChatParamsBase<OpenAIAdditionalChatOptions>,
  ): Promise<AgentChatResponse | StreamingAgentChatResponse> {
    if (mode === ChatResponseMode.WAIT) {
      const chatResponse = await this.llm.chat({
        stream: false,
        ...llmChatParams,
      });

      return this._processMessage(
        task,
        chatResponse.message,
      ) as AgentChatResponse;
    } else if (mode === ChatResponseMode.STREAM) {
      return this._getStreamAiResponse(task, llmChatParams);
    }

    throw new Error("Invalid mode");
  }

  async callFunction(
    tools: BaseTool[],
    toolCall: OpenAIToolCall,
  ): Promise<CallFunctionOutput> {
    const functionCall = toolCall.function;

    if (!functionCall) {
      throw new Error("Invalid tool_call object");
    }

    const functionMessage = await callFunction(tools, toolCall);

    const message = functionMessage[0];
    const toolOutput = functionMessage[1];

    return {
      message,
      toolOutput,
    };
  }

  initializeStep(task: Task): TaskStep {
    const sources: ToolOutput[] = [];

    const newMemory = new ChatMemoryBuffer({
      tokenLimit: task.memory.tokenLimit,
    });

    const taskState = {
      sources,
      nFunctionCalls: 0,
      newMemory,
    };

    task.extraState = {
      ...task.extraState,
      ...taskState,
    };

    return new TaskStep(task.taskId, randomUUID(), task.input);
  }

  private _shouldContinue(
    toolCalls: OpenAIToolCall[] | null,
    nFunctionCalls: number,
  ): boolean {
    if (nFunctionCalls > this.maxFunctionCalls) {
      return false;
    }

    if (toolCalls?.length === 0) {
      return false;
    }

    return true;
  }

  async getTools(input: string): Promise<BaseTool[]> {
    return this._getTools(input);
  }

  private async _runStep(
    step: TaskStep,
    task: Task,
    mode: ChatResponseMode = ChatResponseMode.WAIT,
    toolChoice: ChatCompletionToolChoiceOption = "auto",
  ): Promise<TaskStepOutput> {
    const tools = await this.getTools(task.input);

    if (step.input) {
      addUserStepToMemory(step, task.extraState.newMemory);
    }

    const llmChatParams = this._getLlmChatParams(task, tools, toolChoice);

    const agentChatResponse = await this._getAgentResponse(
      task,
      mode,
      llmChatParams,
    );

    const latestToolCalls = this.getLatestToolCalls(task) || [];

    let isDone: boolean;
    let newSteps: TaskStep[] = [];

    if (
      !this._shouldContinue(latestToolCalls, task.extraState.nFunctionCalls)
    ) {
      isDone = true;
      newSteps = [];
    } else {
      isDone = false;
      for (const toolCall of latestToolCalls) {
        const { message, toolOutput } = await this.callFunction(
          tools,
          toolCall,
        );

        task.extraState.sources.push(toolOutput);
        task.extraState.newMemory.put(message);

        task.extraState.nFunctionCalls += 1;
      }

      newSteps = [step.getNextStep(randomUUID(), undefined)];
    }

    return new TaskStepOutput(agentChatResponse, step, newSteps, isDone);
  }

  async runStep(
    step: TaskStep,
    task: Task,
    chatParams: LLMChatParamsBase<OpenAIAdditionalChatOptions>,
  ): Promise<TaskStepOutput> {
    const toolChoice = chatParams?.additionalChatOptions?.tool_choice ?? "auto";
    return this._runStep(step, task, ChatResponseMode.WAIT, toolChoice);
  }

  async streamStep(
    step: TaskStep,
    task: Task,
    chatParams: LLMChatParamsBase<OpenAIAdditionalChatOptions>,
  ): Promise<TaskStepOutput> {
    const toolChoice = chatParams?.additionalChatOptions?.tool_choice ?? "auto";
    return this._runStep(step, task, ChatResponseMode.STREAM, toolChoice);
  }

  finalizeTask(task: Task): void {
    task.memory.set(task.memory.get().concat(task.extraState.newMemory.get()));
    task.extraState.newMemory.reset();
  }
}
