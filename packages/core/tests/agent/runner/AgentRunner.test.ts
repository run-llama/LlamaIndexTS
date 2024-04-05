import { OpenAIAgentWorker } from "llamaindex/agent/index";
import { AgentRunner } from "llamaindex/agent/runner/base";
import { OpenAI } from "llamaindex/llm/open_ai";
import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_LLM_TEXT_OUTPUT,
  mockLlmGeneration,
} from "../../utility/mockOpenAI.js";

describe("Agent Runner", () => {
  let agentRunner: AgentRunner;

  beforeEach(() => {
    const languageModel = new OpenAI({
      model: "gpt-3.5-turbo",
    });

    mockLlmGeneration({
      languageModel,
    });

    agentRunner = new AgentRunner({
      llm: languageModel,
      agentWorker: new OpenAIAgentWorker({
        llm: languageModel,
        tools: [],
      }),
    });
  });

  it("should be able to initialize a task", () => {
    const task = agentRunner.createTask("hello world");

    expect(task.input).toEqual("hello world");
    expect(task.taskId in agentRunner.state.taskDict).toEqual(true);

    expect(agentRunner.listTasks().length).toEqual(1);
  });

  it("should be able to run a step", async () => {
    const task = agentRunner.createTask("hello world");

    expect(agentRunner.getCompletedSteps(task.taskId)).toBeUndefined();

    const stepOutput = await agentRunner.runStep(task.taskId, task.input);

    const completedSteps = agentRunner.getCompletedSteps(task.taskId);

    expect(completedSteps.length).toEqual(1);

    expect(stepOutput.isLast).toEqual(true);
  });

  it("should be able to finalize a task", async () => {
    const task = agentRunner.createTask("hello world");

    expect(agentRunner.getCompletedSteps(task.taskId)).toBeUndefined();

    const stepOutput1 = await agentRunner.runStep(task.taskId, task.input);

    expect(stepOutput1.isLast).toEqual(true);
  });

  it("should be able to delete a task", () => {
    const task = agentRunner.createTask("hello world");

    expect(agentRunner.listTasks().length).toEqual(1);

    agentRunner.deleteTask(task.taskId);

    expect(agentRunner.listTasks().length).toEqual(0);
  });

  it("should be able to run a chat", async () => {
    const response = await agentRunner.chat({
      message: "hello world",
    });

    expect(agentRunner.listTasks().length).toEqual(1);

    expect(response).toEqual({
      response: DEFAULT_LLM_TEXT_OUTPUT,
      sourceNodes: [],
      sources: [],
    });
  });
});
