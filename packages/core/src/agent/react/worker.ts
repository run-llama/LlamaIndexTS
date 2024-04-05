import { randomUUID } from "@llamaindex/env";
import type { ChatMessage } from "cohere-ai/api";
import { Settings } from "../../Settings.js";
import { AgentChatResponse } from "../../engines/chat/index.js";
import {
  OpenAI,
  isFunctionCallingModel,
  type ChatResponse,
  type LLM,
} from "../../llm/index.js";
import { ChatMemoryBuffer } from "../../memory/ChatMemoryBuffer.js";
import type { ObjectRetriever } from "../../objects/base.js";
import { ToolOutput } from "../../tools/index.js";
import type { BaseTool } from "../../types.js";
import type { AgentWorker, Task } from "../types.js";
import { TaskStep, TaskStepOutput } from "../types.js";
import { ReActChatFormatter } from "./formatter.js";
import { ReActOutputParser } from "./outputParser.js";
import type { BaseReasoningStep } from "./types.js";
import {
  ActionReasoningStep,
  ObservationReasoningStep,
  ResponseReasoningStep,
} from "./types.js";

type ReActAgentWorkerParams = {
  tools: BaseTool[];
  llm?: LLM;
  maxInteractions?: number;
  reactChatFormatter?: ReActChatFormatter | undefined;
  outputParser?: ReActOutputParser | undefined;
  toolRetriever?: ObjectRetriever | undefined;
};

function addUserStepToReasoning(
  step: TaskStep,
  memory: ChatMemoryBuffer,
  currentReasoning: BaseReasoningStep[],
): void {
  if (step.stepState.isFirst) {
    memory.put({
      content: step.input,
      role: "user",
    });
    step.stepState.isFirst = false;
  } else {
    const reasoningStep = new ObservationReasoningStep({
      observation: step.input ?? undefined,
    });
    currentReasoning.push(reasoningStep);
    if (Settings.debug) {
      console.log(`Added user message to memory: ${step.input}`);
    }
  }
}

type ChatParams = {
  messages: ChatMessage[];
  tools?: BaseTool[];
};

/**
 * ReAct agent worker.
 */
export class ReActAgentWorker implements AgentWorker<ChatParams> {
  llm: LLM;

  maxInteractions: number = 10;
  reactChatFormatter: ReActChatFormatter;
  outputParser: ReActOutputParser;

  _getTools: (message: string) => Promise<BaseTool[]>;

  constructor({
    tools,
    llm,
    maxInteractions,
    reactChatFormatter,
    outputParser,
    toolRetriever,
  }: ReActAgentWorkerParams) {
    this.llm =
      llm ?? isFunctionCallingModel(Settings.llm.metadata.model)
        ? Settings.llm
        : new OpenAI({
            model: "gpt-3.5-turbo-0613",
          });

    this.maxInteractions = maxInteractions ?? 10;
    this.reactChatFormatter = reactChatFormatter ?? new ReActChatFormatter();
    this.outputParser = outputParser ?? new ReActOutputParser();

    if (tools.length > 0 && toolRetriever) {
      throw new Error("Cannot specify both tools and tool_retriever");
    } else if (tools.length > 0) {
      this._getTools = async () => tools;
    } else if (toolRetriever) {
      this._getTools = async (message: string) =>
        toolRetriever.retrieve(message);
    } else {
      this._getTools = async () => [];
    }
  }

  initializeStep(task: Task): TaskStep {
    const sources: ToolOutput[] = [];
    const currentReasoning: BaseReasoningStep[] = [];
    const newMemory = new ChatMemoryBuffer({
      tokenLimit: task.memory.tokenLimit,
    });

    const taskState = {
      sources,
      currentReasoning,
      newMemory,
    };

    task.extraState = {
      ...task.extraState,
      ...taskState,
    };

    return new TaskStep(task.taskId, randomUUID(), task.input, {
      isFirst: true,
    });
  }

  extractReasoningStep(
    output: ChatResponse,
    isStreaming: boolean,
  ): [string, BaseReasoningStep[], boolean] {
    if (!output.message.content) {
      throw new Error("Got empty message.");
    }

    const messageContent = output.message.content;
    const currentReasoning: BaseReasoningStep[] = [];

    let reasoningStep;

    try {
      reasoningStep = this.outputParser.parse(
        messageContent,
        isStreaming,
      ) as ActionReasoningStep;
    } catch (e) {
      throw new Error(`Could not parse output: ${e}`);
    }

    if (Settings.debug) {
      console.log(`${reasoningStep.getContent()}\n`);
    }

    currentReasoning.push(reasoningStep);

    if (reasoningStep.isDone()) {
      return [messageContent, currentReasoning, true];
    }

    const actionReasoningStep = new ActionReasoningStep({
      thought: reasoningStep.getContent(),
      action: reasoningStep.action,
      actionInput: reasoningStep.actionInput,
    });

    if (!(actionReasoningStep instanceof ActionReasoningStep)) {
      throw new Error(`Expected ActionReasoningStep, got ${reasoningStep}`);
    }

    return [messageContent, currentReasoning, false];
  }

  async _processActions(
    task: Task,
    tools: BaseTool[],
    output: ChatResponse,
    isStreaming: boolean = false,
  ): Promise<[BaseReasoningStep[], boolean]> {
    const toolsDict: Record<string, BaseTool> = {};

    for (const tool of tools) {
      toolsDict[tool.metadata.name] = tool;
    }

    const [_, currentReasoning, isDone] = this.extractReasoningStep(
      output,
      isStreaming,
    );

    if (isDone) {
      return [currentReasoning, true];
    }

    const reasoningStep = currentReasoning[
      currentReasoning.length - 1
    ] as ActionReasoningStep;

    const actionReasoningStep = new ActionReasoningStep({
      thought: reasoningStep.getContent(),
      action: reasoningStep.action,
      actionInput: reasoningStep.actionInput,
    });

    const tool = toolsDict[actionReasoningStep.action];

    const toolOutput = await tool?.call?.(actionReasoningStep.actionInput);

    task.extraState.sources.push(
      new ToolOutput(
        toolOutput,
        tool.metadata.name,
        actionReasoningStep.actionInput,
        toolOutput,
      ),
    );

    const observationStep = new ObservationReasoningStep({
      observation: toolOutput,
    });

    currentReasoning.push(observationStep);

    if (Settings.debug) {
      console.log(`${observationStep.getContent()}`);
    }

    return [currentReasoning, false];
  }

  _getResponse(
    currentReasoning: BaseReasoningStep[],
    sources: ToolOutput[],
  ): AgentChatResponse {
    if (currentReasoning.length === 0) {
      throw new Error("No reasoning steps were taken.");
    } else if (currentReasoning.length === this.maxInteractions) {
      throw new Error("Reached max iterations.");
    }

    const responseStep = currentReasoning[currentReasoning.length - 1];

    let responseStr: string;

    if (responseStep instanceof ResponseReasoningStep) {
      responseStr = responseStep.response;
    } else {
      responseStr = responseStep.getContent();
    }

    return new AgentChatResponse(responseStr, sources);
  }

  _getTaskStepResponse(
    agentResponse: AgentChatResponse,
    step: TaskStep,
    isDone: boolean,
  ): TaskStepOutput {
    let newSteps: TaskStep[] = [];

    if (isDone) {
      newSteps = [];
    } else {
      newSteps = [step.getNextStep(randomUUID(), undefined)];
    }

    return new TaskStepOutput(agentResponse, step, newSteps, isDone);
  }

  async _runStep(step: TaskStep, task: Task): Promise<TaskStepOutput> {
    if (step.input) {
      addUserStepToReasoning(
        step,
        task.extraState.newMemory,
        task.extraState.currentReasoning,
      );
    }

    const tools = await this._getTools(task.input);

    const inputChat = this.reactChatFormatter.format(
      tools,
      [...task.memory.getAll(), ...task.extraState.newMemory.getAll()],
      task.extraState.currentReasoning,
    );

    const chatResponse = await this.llm.chat({
      messages: inputChat,
    });

    const [reasoningSteps, isDone] = await this._processActions(
      task,
      tools,
      chatResponse,
    );

    task.extraState.currentReasoning.push(...reasoningSteps);

    const agentResponse = this._getResponse(
      task.extraState.currentReasoning,
      task.extraState.sources,
    );

    if (isDone) {
      task.extraState.newMemory.put({
        content: agentResponse.response,
        role: "assistant",
      });
    }

    return this._getTaskStepResponse(agentResponse, step, isDone);
  }

  async runStep(step: TaskStep, task: Task): Promise<TaskStepOutput> {
    return await this._runStep(step, task);
  }

  streamStep(): Promise<TaskStepOutput> {
    throw new Error("Method not implemented.");
  }

  finalizeTask(task: Task): void {
    task.memory.set(task.memory.get() + task.extraState.newMemory.get());
    task.extraState.newMemory.reset();
  }
}
