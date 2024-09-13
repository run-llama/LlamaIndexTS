import { beforeEach, describe, expect, test, vi, type Mocked } from "vitest";
import type { Context } from "../src/workflow/context.js";
import {
  StartEvent,
  StopEvent,
  WorkflowEvent,
} from "../src/workflow/events.js";
import { Workflow } from "../src/workflow/workflow.js";

// mock OpenAI class for testing
class OpenAI {
  complete = vi.fn();
}

class JokeEvent extends WorkflowEvent<{ joke: string }> {}
class AnalysisEvent extends WorkflowEvent<{ analysis: string }> {}

describe("Workflow", () => {
  let mockLLM: Mocked<OpenAI>;
  let generateJoke: Mocked<any>;
  let critiqueJoke: Mocked<any>;
  let analyzeJoke: Mocked<any>;
  beforeEach(() => {
    mockLLM = new OpenAI() as Mocked<OpenAI>;
    mockLLM.complete
      .mockResolvedValueOnce({
        text: "Why do pirates make great singers? They can hit the high Cs!",
      })
      .mockResolvedValueOnce({
        text: "This joke is clever but could use improvement...",
      })
      .mockResolvedValueOnce({
        text: "The analysis is insightful and helpful.",
      });

    generateJoke = vi.fn(async (_context, ev: StartEvent) => {
      const response = await mockLLM.complete({
        prompt: `Write your best joke about ${ev.data.input}.`,
      });
      return new JokeEvent({ joke: response.text });
    });

    critiqueJoke = vi.fn(async (_context, ev: JokeEvent) => {
      const response = await mockLLM.complete({
        prompt: `Give a thorough critique of the following joke: ${ev.data.joke}`,
      });
      return new StopEvent({ result: response.text });
    });

    analyzeJoke = vi.fn(async (_context: Context, ev: JokeEvent) => {
      const prompt = `Give a thorough analysis of the following joke: ${ev.data.joke}`;
      const response = await mockLLM.complete({ prompt });
      return new AnalysisEvent({ analysis: response.text });
    });
  });

  test("addStep", () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, generateJoke);
    jokeFlow.addStep(JokeEvent, critiqueJoke);

    expect(jokeFlow.hasStep(generateJoke)).toBe(true);
    expect(jokeFlow.hasStep(critiqueJoke)).toBe(true);
  });

  test("run workflow", async () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, generateJoke);
    jokeFlow.addStep(JokeEvent, critiqueJoke);

    const result = await jokeFlow.run("pirates");

    expect(generateJoke).toHaveBeenCalledTimes(1);
    expect(critiqueJoke).toHaveBeenCalledTimes(1);
    expect(result.data.result).toBe(
      "This joke is clever but could use improvement...",
    );
  });

  test("stream events", async () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, generateJoke);
    jokeFlow.addStep(JokeEvent, critiqueJoke);

    const run = jokeFlow.run("pirates");
    const event = await jokeFlow.streamEvents().next(); // get one event to avoid testing timeout
    const result = await run;

    expect(generateJoke).toHaveBeenCalledTimes(1);
    expect(critiqueJoke).toHaveBeenCalledTimes(1);
    expect(result.data.result).toBe(
      "This joke is clever but could use improvement...",
    );
    expect(event).not.toBeNull();
  });

  test("workflow timeout", async () => {
    const TIMEOUT = 1;
    const jokeFlow = new Workflow({ verbose: true, timeout: TIMEOUT });

    const longRunning = async (_context: Context, ev: StartEvent) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
      return new StopEvent({ result: "We waited 2 seconds" });
    };

    jokeFlow.addStep(StartEvent, longRunning);
    const run = jokeFlow.run("Let's start");
    await expect(run).rejects.toThrow(
      `Operation timed out after ${TIMEOUT} seconds`,
    );
  });

  test("workflow validation", async () => {
    const jokeFlow = new Workflow({ verbose: true, validate: true });
    jokeFlow.addStep(StartEvent, generateJoke, { outputs: StopEvent });
    jokeFlow.addStep(JokeEvent, critiqueJoke, { outputs: StopEvent });
    const run = jokeFlow.run("pirates");
    await expect(run).rejects.toThrow(
      "The following events are consumed but never produced: JokeEvent",
    );
  });

  test("collectEvents", async () => {
    let collectedEvents: WorkflowEvent[] | null = null;
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, generateJoke);
    jokeFlow.addStep(JokeEvent, analyzeJoke);
    jokeFlow.addStep([AnalysisEvent], async (context, ev) => {
      collectedEvents = context.collectEvents(ev, [AnalysisEvent]);
      return new StopEvent({ result: "Report generated" });
    });

    const result = await jokeFlow.run("pirates");
    expect(generateJoke).toHaveBeenCalledTimes(1);
    expect(analyzeJoke).toHaveBeenCalledTimes(1);
    expect(result.data.result).toBe("Report generated");
    expect(collectedEvents).toHaveLength(1);
  });
});
