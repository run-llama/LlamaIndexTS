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

    jokeFlow.addStep(StartEvent, longRunning);
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
});

describe("Workflow event loop", () => {
  test("basic", async () => {
    const jokeFlow = new Workflow({ verbose: true });

    jokeFlow.addStep(StartEvent, async (_context, ev: StartEvent) => {
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

    myFlow.addStep(StartEvent, async (_context, ev: StartEvent) => {
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

    myFlow.addStep(StartEvent, async (_context, ev: StartEvent) => {
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
    expect(fn).toHaveBeenCalledTimes(0);

    // streaming events will allow to consume event even stop event is reached
    const stream = myFlow.run("world");
    for await (const _ of stream) {
    }
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
