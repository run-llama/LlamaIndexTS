// Assuming that the necessary interfaces and classes (like BaseTool, OpenAI, ChatMessage, CallbackManager, etc.) are defined elsewhere

import { BaseTool } from "../../Tool";
import { CallbackManager } from "../../callbacks/CallbackManager";
import { AgentChatResponse, ChatResponseMode } from "../../engines/chat";
import { ChatMessage, ChatResponse, LLM, OpenAI } from "../../llm";
import { ObjectRetriever } from "../../objects/base";
import { ToolOutput } from "../../tools/types";
import { AgentWorker, Task, TaskStep, TaskStepOutput } from "../types";
import { OpenAIToolCall } from "./types/chat";
import { toOpenAiTool } from "./utils";

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

function callToolWithErrorHandling(
  tool: BaseTool,
  inputDict: { [key: string]: any },
  errorMessage: string | null = null,
  raiseError: boolean = false,
): ToolOutput {
  try {
    return {
      ...tool,
      ...(inputDict as ToolOutput),
    };
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

function callFunction(
  tools: BaseTool[],
  toolCall: OpenAIToolCall,
  verbose: boolean = false,
): [ChatMessage, ToolOutput] {
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
  const output = callToolWithErrorHandling(tool, argumentDict, null);

  if (verbose) {
    console.log(`Got output: ${output}`);
    console.log("========================\n");
  }

  return [
    {
      content: output,
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

export class OpenAIAgentWorker extends AgentWorker {
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
    super();

    this._llm = llm || new OpenAI({ model: "gpt-3.5-turbo" });
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

  // Static method 'from_tools' would be a static method in TypeScript
  fromTools(
    tools: BaseTool[] | null = null,
    toolRetriever: ObjectRetriever<BaseTool> | null = null,
    llm: LLM | null = null,
    verbose: boolean = false,
    maxFunctionCalls: number = DEFAULT_MAX_FUNCTION_CALLS,
    callbackManager: CallbackManager | null = null,
    systemPrompt: string | null = null,
    prefixMessages: ChatMessage[] | null = null,
    ...args: any[]
  ): OpenAIAgentWorker {
    tools = tools || [];

    llm =
      llm ||
      new OpenAI({
        model: "gpt-3.5-turbo",
      });

    if (!(llm instanceof OpenAI)) {
      throw new Error("llm must be an OpenAI instance");
    }

    if (callbackManager) {
      llm.callbackManager = callbackManager;
    }

    // if (!llm.metadata.isFunctionCallingModel) {
    //     throw new Error(`Model name ${llm.model} does not support function calling API.`);
    // }

    if (systemPrompt) {
      if (prefixMessages) {
        throw new Error("Cannot specify both systemPrompt and prefixMessages");
      }
      prefixMessages = [
        {
          content: systemPrompt,
          role: "system",
        },
      ];
    }

    prefixMessages = prefixMessages || [];

    return new OpenAIAgentWorker({
      tools,
      llm,
      prefixMessages,
      verbose,
      maxFunctionCalls,
      callbackManager: undefined,
      //   toolRetriever:,
      // callbackManager
    });
  }

  // Other methods would be translated similarly. For instance:
  public getAllMessages(task: Task): ChatMessage[] {
    return [
      ...this.prefixMessages,
      //   ...task.memory.get(),
      //   ...task.extraState.newMemory.get(),
    ];
  }

  public getLatestToolCalls(task: Task): OpenAIToolCall[] | null {
    const chatHistory: ChatMessage[] = [];

    return chatHistory.length > 0
      ? chatHistory[chatHistory.length - 1].additionalKwargs?.toolCalls
      : null;
  }

  private _getLlmChatKwargs(
    task: Task,
    openaiTools: { [key: string]: any }[],
    toolChoice: string | { [key: string]: any } = "auto",
  ): { [key: string]: any } {
    const llmChatKwargs: { [key: string]: any } = {
      messages: [
        {
          content: task.input,
          role: "user",
        },
      ],
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
  ): AgentChatResponse {
    const aiMessage = chatResponse.message;
    task.extraState.newMemory.put(aiMessage);
    return new AgentChatResponse(aiMessage.content, task.extraState.sources);
  }

  private async _getAgentResponse(
    task: Task,
    mode: ChatResponseMode,
    llmChatKwargs: any,
  ): Promise<AgentChatResponse> {
    if (mode === ChatResponseMode.WAIT) {
      // TODO: Implement STREAM mode
      // @ts-ignore
      const chatResponse: ChatResponse = await this._llm.chat(llmChatKwargs);

      console.log({ chatResponse });

      return this._processMessage(task, chatResponse);
    } else {
      throw new Error("Not implemented");
    }
  }

  async callFunction(
    tools: BaseTool[],
    toolCall: OpenAIToolCall,
    memory: any,
    sources: ToolOutput[],
  ): Promise<void> {
    const functionCall = toolCall.function;

    if (!functionCall) {
      throw new Error("Invalid tool_call object");
    }

    if (functionCall.type !== "function") {
      throw new Error("Invalid tool type. Unsupported by OpenAI");
    }

    const functionMessage = callFunction(tools, toolCall, this._verbose);

    const functionOutput = functionMessage[1];
    const functionMessageContent = functionMessage[0].content;

    sources.push(functionOutput);
    memory.put(functionMessageContent);
  }

  initializeStep(task: Task, kwargs?: any): TaskStep {
    const sources: ToolOutput[] = [];
    const taskState = {
      sources,
      nFunctionCalls: 0,
    };

    task.extraState = {
      ...task.extraState,
      ...taskState,
    };

    return new TaskStep(task.taskId, Math.random().toString(), task.input);
  }

  private _shouldContinue(
    toolCalls: OpenAIToolCall[] | null,
    nFunctionCalls: number,
  ): boolean {
    if (nFunctionCalls > this._maxFunctionCalls) {
      return false;
    }

    if (!toolCalls) {
      return false;
    }

    if (toolCalls.length === 0) {
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
    // if (step.input) {
    //     addUserStepToMemory(
    //         step,
    //         task.extraState.newMemory,
    //         this._verbose
    //     );
    // }

    const tools = this.getTools(task.input);

    const openaiTools = tools.map((tool) =>
      toOpenAiTool({
        name: tool.metadata.name,
        description: tool.metadata.description,
        parameters: {
          type: "object",
          properties: {
            a: {
              type: "number",
              description: "The first argument",
            },
            b: {
              type: "number",
              description: "The second argument",
            },
          },
        },
      }),
    );

    console.log({ openaiTools: openaiTools[0].function });

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
    } else {
      isDone = false;
      for (const toolCall of latestToolCalls) {
        this.callFunction(
          tools,
          toolCall,
          task.extraState.newMemory,
          task.extraState.sources,
        );
        task.extraState.nFunctionCalls += 1;
      }

      newSteps = [new TaskStep(task.taskId, Math.random().toString(), null)];
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
