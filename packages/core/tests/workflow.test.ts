import type { Context } from "@llamaindex/core/workflow";
import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/core/workflow";
import { beforeEach, describe, expect, test, vi, type Mocked } from "vitest";

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
    const event = await run[Symbol.asyncIterator]().next(); // get one event to avoid testing timeout
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

    jokeFlow.addStep(StartEvent<string>, longRunning);
    const run = jokeFlow.run("Let's start");
    await expect(run).rejects.toThrow(
      `Operation timed out after ${TIMEOUT} seconds`,
    );
  });

  // // fixme: design a better API for validation
  // test("workflow validation", async () => {
  //   const jokeFlow = new Workflow({ verbose: true, validate: true });
  //   jokeFlow.addStep(StartEvent, generateJoke, { outputs: StopEvent });
  //   jokeFlow.addStep(JokeEvent, critiqueJoke, { outputs: StopEvent });
  //   expect(() => {
  //     jokeFlow.run("pirates");
  //   }).toThrow(
  //     "The following events are consumed but never produced: JokeEvent",
  //   );
  // });

  // fixme: we could handle collectEvents natively instead of user calling it
  test("collectEvents", async () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, generateJoke);
    jokeFlow.addStep(JokeEvent, analyzeJoke);
    jokeFlow.addStep([AnalysisEvent], async () => {
      return new StopEvent({ result: "Report generated" });
    });

    const result = await jokeFlow.run("pirates");
    expect(generateJoke).toHaveBeenCalledTimes(1);
    expect(analyzeJoke).toHaveBeenCalledTimes(1);
    expect(result.data.result).toBe("Report generated");
  });

  test("run workflow with multiple in-degree", async () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, generateJoke);
    jokeFlow.addStep(JokeEvent, analyzeJoke);
    jokeFlow.addStep([JokeEvent, AnalysisEvent], async (context, ...events) => {
      return new StopEvent({
        result: "The analysis is insightful and helpful.",
      });
    });

    const result = await jokeFlow.run("pirates");
    expect(result.data.result).toBe("The analysis is insightful and helpful.");
  });

  test("run invalid workflow", async () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, generateJoke);
    jokeFlow.addStep(JokeEvent, analyzeJoke);
    jokeFlow.addStep([JokeEvent], async (context, ...events) => {
      return new StopEvent({
        result: "The analysis is insightful and helpful.",
      });
    });
    const consoleSpy = vi.spyOn(console, "warn");
    expect(consoleSpy).toHaveBeenCalledTimes(0);
    const result = await jokeFlow.run("pirates");
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
    expect(result.data.result).toBe("The analysis is insightful and helpful.");
  });

  test("run workflow with object-based StartEvent and StopEvent", async () => {
    const objectFlow = new Workflow<Person>({ verbose: true });

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
});

describe("Workflow event loop", () => {
  test("basic", async () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent<string>, async (_context, ev: StartEvent) => {
      return new StopEvent({ result: `Hello ${ev.data.input}!` });
    });

    const result = await jokeFlow.run("world");
    expect(result.data.result).toBe("Hello world!");
  });

  test("branch", async () => {
    const myFlow = new Workflow({ verbose: true });

    class BranchA1Event extends WorkflowEvent<{ payload: string }> {}

    class BranchA2Event extends WorkflowEvent<{ payload: string }> {}

    class BranchB1Event extends WorkflowEvent<{ payload: string }> {}

    class BranchB2Event extends WorkflowEvent<{ payload: string }> {}

    let control = false;

    myFlow.addStep(StartEvent<string>, async (_context, ev: StartEvent) => {
      if (control) {
        return new BranchA1Event({ payload: ev.data.input });
      } else {
        return new BranchB1Event({ payload: ev.data.input });
      }
    });

    myFlow.addStep(BranchA1Event, async (_context, ev: BranchA1Event) => {
      return new BranchA2Event({ payload: ev.data.payload });
    });

    myFlow.addStep(BranchB1Event, async (_context, ev: BranchB1Event) => {
      return new BranchB2Event({ payload: ev.data.payload });
    });

    myFlow.addStep(BranchA2Event, async (_context, ev: BranchA2Event) => {
      return new StopEvent({ result: `Branch A2: ${ev.data.payload}` });
    });

    myFlow.addStep(BranchB2Event, async (_context, ev: BranchB2Event) => {
      return new StopEvent({ result: `Branch B2: ${ev.data.payload}` });
    });

    {
      const result = await myFlow.run("world");
      expect(result.data.result).toMatch(/Branch B2: world/);
    }

    control = true;

    {
      const result = await myFlow.run("world");
      expect(result.data.result).toMatch(/Branch A2: world/);
    }

    {
      const context = myFlow.run("world");
      for await (const event of context) {
        if (event instanceof BranchA2Event) {
          expect(event.data.payload).toBe("world");
        }
        if (event instanceof StopEvent) {
          expect(event.data.result).toMatch(/Branch A2: world/);
        }
      }
    }
  });

  test("one event have multiple outputs", async () => {
    const myFlow = new Workflow({ verbose: true });

    class AEvent extends WorkflowEvent<{ payload: string }> {}

    class BEvent extends WorkflowEvent<{ payload: string }> {}

    class CEvent extends WorkflowEvent<{ payload: string }> {}

    class DEvent extends WorkflowEvent<{ payload: string }> {}

    myFlow.addStep(StartEvent<string>, async (_context, ev: StartEvent) => {
      return new StopEvent({ result: "STOP" });
    });

    const fn = vi.fn(async (_context, ev: StartEvent) => {
      return new AEvent({ payload: ev.data.input });
    });

    myFlow.addStep(StartEvent, fn);
    myFlow.addStep(AEvent, async (_context, ev: AEvent) => {
      return new BEvent({ payload: ev.data.payload });
    });
    myFlow.addStep(AEvent, async (_context, ev: AEvent) => {
      return new CEvent({ payload: ev.data.payload });
    });
    myFlow.addStep(BEvent, async (_context, ev: BEvent) => {
      return new DEvent({ payload: ev.data.payload });
    });
    myFlow.addStep(CEvent, async (_context, ev: CEvent) => {
      return new DEvent({ payload: ev.data.payload });
    });
    myFlow.addStep(DEvent, async (_context, ev: DEvent) => {
      return new StopEvent({ result: `Hello ${ev.data.payload}!` });
    });

    const result = await myFlow.run("world");
    expect(result.data.result).toBe("STOP");
    expect(fn).toHaveBeenCalledTimes(1);

    // streaming events will allow to consume event even stop event is reached
    const stream = myFlow.run("world");
    for await (const _ of stream) {
    }
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("run with custom context", async () => {
    type MyContext = { name: string };
    const myFlow = new Workflow<string, MyContext>({ verbose: true }).with({
      name: "Alice",
    });
    myFlow.addStep(
      StartEvent<string>,
      async (context: MyContext, _: StartEvent) => {
        return new StopEvent({ result: `Hello ${context.name}!` });
      },
    );

    const result = await myFlow.run("world").with({ name: "Alice" });
    expect(result.data.result).toBe("Hello Alice!");
  });

  test("run with custom context with two streaming", async () => {
    type MyContext = { name: string };
    const myFlow = new Workflow<string, MyContext>({ verbose: true });
    myFlow.addStep(StartEvent<string>, async (context, _) => {
      if (context === null) {
        return new StopEvent({ result: "EMPTY" });
      }
      return new StopEvent({ result: `Hello ${context.name}!` });
    });

    const context1 = myFlow.run("world");
    const context2 = context1.with({ name: "Alice" });
    const context3 = context1.with({ name: "Bob" });
    expect(await context1).toMatchInlineSnapshot(`
      StopEvent {
        "data": {
          "result": "EMPTY",
        },
        "displayName": "StopEvent",
      }
    `);
    expect(await context2).toMatchInlineSnapshot(`
            StopEvent {
              "data": {
                "result": "Hello Alice!",
              },
              "displayName": "StopEvent",
            }
          `);
    expect(await context3).toMatchInlineSnapshot(`
      StopEvent {
        "data": {
          "result": "Hello Bob!",
        },
        "displayName": "StopEvent",
      }
    `);
  });
});

describe("snapshot", async () => {
  test("snapshot and recover", async () => {
    const myFlow = new Workflow({ verbose: true });
    myFlow.addStep(StartEvent<string>, async (_context, ev: StartEvent) => {
      return new StopEvent({ result: `Hello ${ev.data.input}!` });
    });
    const context = myFlow.run("world");
    const arrayBuffer = context.snapshot();
    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    const context2 = await myFlow.recover(arrayBuffer);
    expect(context2.data.result).toBe("Hello world!");
  });
});
