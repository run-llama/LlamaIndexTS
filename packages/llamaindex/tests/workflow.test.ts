import {
  Context,
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/core/workflow";
import { OpenAI } from "llamaindex";
import { beforeEach, describe, expect, test, vi, type Mocked } from "vitest";

// Create a custom event type
class JokeEvent extends WorkflowEvent<{ joke: string }> {}

vi.mock("llamaindex", () => ({
  OpenAI: vi.fn(() => ({
    complete: vi.fn(),
  })),
}));

describe("Workflow", () => {
  let mockLLM: Mocked<OpenAI>;
  let generateJoke: Mocked<any>;
  let critiqueJoke: Mocked<any>;

  beforeEach(() => {
    mockLLM = new OpenAI() as Mocked<OpenAI>;
    mockLLM.complete
      .mockResolvedValueOnce({
        text: "Why do pirates make great singers? They can hit the high Cs!",
        raw: {},
      })
      .mockResolvedValueOnce({
        text: "This joke is clever but could use improvement...",
        raw: {},
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
});
