// Assuming that the necessary interfaces and classes (like BaseTool, OpenAI, ChatMessage, CallbackManager, etc.) are defined elsewhere

import { randomUUID } from "crypto";
import { BaseTool } from "../../Tool";
import { CallbackManager } from "../../callbacks/CallbackManager";
import { AgentChatResponse, ChatResponseMode } from "../../engines/chat";
import {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  OpenAI,
} from "../../llm";
import { ChatMemoryBuffer } from "../../memory/ChatMemoryBuffer";
import { ObjectRetriever } from "../../objects/base";
import { ToolOutput } from "../../tools/types";
import { AgentWorker, Task, TaskStep, TaskStepOutput } from "../types";
import { addUserStepToMemory } from "../utils";
import { OpenAIToolCall } from "./types/chat";
import { OpenAiFunction, toOpenAiTool } from "./utils";

const DEFAULT_MAX_FUNCTION_CALLS = 5;

function getFunctionByName(tools: BaseTool[], name: string): BaseTool {
  const nameToTool: { [key: string]: BaseTool } = {};
  tools.forEach((tool) => {
    nameToTool[tool.metadata.name] = tool;
  });

  if (!(name in nameToTool)) {
    throw new Error(`Tool with name ${name} not found`);
  }

  return nameToTool[name];
}

async function callToolWithErrorHandling(
  tool: BaseTool,
  inputDict: { [key: string]: any },
  errorMessage: string | null = null,
  raiseError: boolean = false,
): Promise<ToolOutput> {
  try {
    const value = await tool.call(inputDict);
    return new ToolOutput(value, tool.metadata.name, inputDict, value);
  } catch (e) {
    if (raiseError) {
      throw e;
    }
    errorMessage = errorMessage || `Error: ${e}`;
    return new ToolOutput(
      errorMessage,
      tool.metadata.name,
      { kwargs: inputDict },
      e,
    );
  }
}

async function callFunction(
  tools: BaseTool[],
  toolCall: OpenAIToolCall,
  verbose: boolean = false,
): Promise<[ChatMessage, ToolOutput]> {
  const id_ = toolCall.id;
  const functionCall = toolCall.function;
  const name = toolCall.function.name;
  const argumentsStr = toolCall.function.arguments;

  if (verbose) {
    console.log("=== Calling Function ===");
    console.log(`Calling function: ${name} with args: ${argumentsStr}`);
  }

  const tool = getFunctionByName(tools, name);
  const argumentDict = JSON.parse(argumentsStr);

  // Call tool
  // Use default error message
  const output = await callToolWithErrorHandling(tool, argumentDict, null);

  if (verbose) {
    console.log(`Got output ${output}`);
    console.log("==========================");
  }

  return [
    {
      content: String(output),
      role: "tool",
      additionalKwargs: {
        name,
        tool_call_id: id_,
      },
    },
    output,
  ];
}

type OpenAIAgentWorkerParams = {
  tools: BaseTool[];
  llm?: OpenAI;
  prefixMessages?: ChatMessage[];
  verbose?: boolean;
  maxFunctionCalls?: number;
  callbackManager?: CallbackManager | undefined;
  toolRetriever?: ObjectRetriever<BaseTool>;
};

export class OpenAIAgentWorker implements AgentWorker {
  private _llm: OpenAI;
  private _verbose: boolean;
  private _maxFunctionCalls: number;

  public prefixMessages: ChatMessage[];
  public callbackManager: CallbackManager | undefined;

  private _getTools: (input: string) => BaseTool[];

  constructor({
    tools,
    llm,
    prefixMessages,
    verbose,
    maxFunctionCalls = DEFAULT_MAX_FUNCTION_CALLS,
    callbackManager,
    toolRetriever,
  }: OpenAIAgentWorkerParams) {
    this._llm = llm ?? new OpenAI({ model: "gpt-3.5-turbo-1106" });
    this._verbose = verbose || false;
    this._maxFunctionCalls = maxFunctionCalls;
    this.prefixMessages = prefixMessages || [];
    this.callbackManager = callbackManager || this._llm.callbackManager;

    if (tools.length > 0 && toolRetriever) {
      throw new Error("Cannot specify both tools and tool_retriever");
    } else if (tools.length > 0) {
      this._getTools = () => tools;
    } else if (toolRetriever) {
      // @ts-ignore
      this._getTools = (message: string) => toolRetriever.retrieve(message);
    } else {
      this._getTools = () => [];
    }
  }

  // Other methods would be translated similarly. For instance:
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

    return chatHistory[chatHistory.length - 1].additionalKwargs?.toolCalls;
  }

  private _getLlmChatKwargs(
    task: Task,
    openaiTools: { [key: string]: any }[],
    toolChoice: string | { [key: string]: any } = "auto",
  ): { [key: string]: any } {
    const llmChatKwargs: { [key: string]: any } = {
      messages: this.getAllMessages(task),
    };

    if (openaiTools.length > 0) {
      llmChatKwargs.tools = openaiTools;
      llmChatKwargs.toolChoice = toolChoice;
    }

    return llmChatKwargs;
  }

  private _processMessage(
    task: Task,
    chatResponse: ChatResponse,
  ): AgentChatResponse | AsyncIterable<ChatResponseChunk> {
    const aiMessage = chatResponse.message;
    task.extraState.newMemory.put(chatResponse.message);
    return new AgentChatResponse(aiMessage.content, task.extraState.sources);
  }

  private async _getAgentResponse(
    task: Task,
    mode: ChatResponseMode,
    llmChatKwargs: any,
  ): Promise<AgentChatResponse> {
    if (mode === ChatResponseMode.WAIT) {
      const chatResponse = await this._llm.chat({
        stream: false,
        ...llmChatKwargs,
      });

      // @ts-ignore
      return this._processMessage(task, chatResponse);
    } else {
      throw new Error("Not implemented");
    }
  }

  async callFunction(
    tools: BaseTool[],
    toolCall: OpenAIToolCall,
    memory: ChatMemoryBuffer,
    sources: ToolOutput[],
  ): Promise<void> {
    const functionCall = toolCall.function;

    if (!functionCall) {
      throw new Error("Invalid tool_call object");
    }

    const functionMessage = await callFunction(tools, toolCall, this._verbose);

    const message = functionMessage[0];
    const toolOutput = functionMessage[1];

    sources.push(toolOutput);
    memory.put(message);
  }

  initializeStep(task: Task, kwargs?: any): TaskStep {
    const sources: ToolOutput[] = [];

    const newMemory = new ChatMemoryBuffer();

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
    if (nFunctionCalls > this._maxFunctionCalls) {
      return false;
    }

    if (!toolCalls || toolCalls.length === 0) {
      return false;
    }

    return true;
  }

  getTools(input: string): BaseTool[] {
    return this._getTools(input);
  }

  async _runStep(
    step: TaskStep,
    task: Task,
    mode: ChatResponseMode = ChatResponseMode.WAIT,
    toolChoice: string | { [key: string]: any } = "auto",
  ): Promise<TaskStepOutput> {
    const tools = this.getTools(task.input);
    let openaiTools: OpenAiFunction[] = [];

    if (step.input) {
      addUserStepToMemory(step, task.extraState.newMemory, this._verbose);
    }

    if (step.input) {
      tools.map((tool) =>
        toOpenAiTool({
          name: tool.metadata.name,
          description: tool.metadata.description,
          parameters: tool.metadata.parameters,
        }),
      );
    }

    const llmChatKwargs = this._getLlmChatKwargs(task, openaiTools, toolChoice);

    const agentChatResponse = await this._getAgentResponse(
      task,
      mode,
      llmChatKwargs,
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
        await this.callFunction(
          tools,
          toolCall,
          task.extraState.newMemory,
          task.extraState.sources,
        );
        task.extraState.nFunctionCalls += 1;
      }
    }

    if (!isDone) {
      newSteps = [step.getNextStep(randomUUID(), undefined)];
    } else {
      newSteps = [];
    }

    return new TaskStepOutput(agentChatResponse, step, newSteps, isDone);
  }

  async runStep(
    step: TaskStep,
    task: Task,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    const toolChoice = kwargs?.toolChoice || "auto";
    return this._runStep(step, task, ChatResponseMode.WAIT, toolChoice);
  }

  async streamStep(
    step: TaskStep,
    task: Task,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    const toolChoice = kwargs?.toolChoice || "auto";
    return this._runStep(step, task, ChatResponseMode.STREAM, toolChoice);
  }

  finalizeTask(task: Task, kwargs?: any): void {
    task.memory.set(task.memory.get().concat(task.extraState.newMemory.get()));
    task.extraState.newMemory.reset();
  }
}
