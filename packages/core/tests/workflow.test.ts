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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let generateJoke: Mocked<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let critiqueJoke: Mocked<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  test("run workflow with object-based StartEvent and StopEvent", async () => {
    const objectFlow = new Workflow({ verbose: true });

    type Person = { name: string; age: number };

    const processObject = vi.fn(async (_context, ev: StartEvent<Person>) => {
      const { name, age } = ev.data.input;
      return new StopEvent({
        result: { greeting: `Hello ${name}, you are ${age} years old!` },
      });
    });

    objectFlow.addStep(StartEvent<Person>, processObject);

    const result = await objectFlow.run(
      new StartEvent<Person>({
        input: { name: "Alice", age: 30 },
      }),
    );

    expect(processObject).toHaveBeenCalledTimes(1);
    expect(result.data.result).toEqual({
      greeting: "Hello Alice, you are 30 years old!",
    });
  });

  test("workflow with two concurrent steps", async () => {
    const concurrentFlow = new Workflow({ verbose: true });

    const step1 = vi.fn(async (_context, _ev: StartEvent) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return new StopEvent({ result: "Step 1 completed" });
    });

    const step2 = vi.fn(async (_context, _ev: StartEvent) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return new StopEvent({ result: "Step 2 completed" });
    });

    concurrentFlow.addStep(StartEvent, step1);
    concurrentFlow.addStep(StartEvent, step2);

    const startTime = new Date();
    const result = await concurrentFlow.run("start");
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    expect(step1).toHaveBeenCalledTimes(1);
    expect(step2).toHaveBeenCalledTimes(1);
    expect(duration).toBeLessThan(200);
    expect(result.data.result).toBe("Step 2 completed");
  });

  test("workflow with two concurrent cyclic steps", async () => {
    const concurrentCyclicFlow = new Workflow({ verbose: true });

    class Step1Event extends WorkflowEvent {}
    class Step2Event extends WorkflowEvent {}

    let step2Count = 0;

    const step1 = vi.fn(async (_context, ev: StartEvent | Step1Event) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return new Step1Event({ result: "Step 1 completed" });
    });

    const step2 = vi.fn(async (_context, ev: StartEvent | Step2Event) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      step2Count++;
      if (step2Count >= 5) {
        return new StopEvent({ result: "Step 2 completed 5 times" });
      }
      return new Step2Event({ result: "Step 2 completed" });
    });

    concurrentCyclicFlow.addStep([StartEvent, Step1Event], step1);
    concurrentCyclicFlow.addStep([StartEvent, Step2Event], step2);

    const startTime = new Date();
    const result = await concurrentCyclicFlow.run("start");
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    expect(step1).toHaveBeenCalledTimes(1);
    expect(step2).toHaveBeenCalledTimes(5);
    expect(duration).toBeGreaterThan(500); // At least 5 * 100ms for step2
    expect(duration).toBeLessThan(1000); // Less than 1 second
    expect(result.data.result).toBe("Step 2 completed 5 times");
  });
});
