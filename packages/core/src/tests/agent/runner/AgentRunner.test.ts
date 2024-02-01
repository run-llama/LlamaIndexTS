import { OpenAIAgentWorker } from "../../../agent";
import { AgentRunner } from "../../../agent/runner/base";
import { CallbackManager } from "../../../callbacks/CallbackManager";
import { OpenAI } from "../../../llm/LLM";

import {
  DEFAULT_LLM_TEXT_OUTPUT,
  mockLlmGeneration,
} from "../../utility/mockOpenAI";

jest.mock("../../../llm/open_ai", () => {
  return {
    getOpenAISession: jest.fn().mockImplementation(() => null),
  };
});

describe("Agent Runner", () => {
  let agentRunner: AgentRunner;

  beforeEach(() => {
    const callbackManager = new CallbackManager({});

    const languageModel = new OpenAI({
      model: "gpt-3.5-turbo",
      callbackManager,
    });

    mockLlmGeneration({
      languageModel,
      callbackManager,
    });

    agentRunner = new AgentRunner({
      llm: languageModel,
      agentWorker: new OpenAIAgentWorker({
        llm: languageModel,
        tools: [],
        verbose: false,
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
