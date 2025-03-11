import {
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
  type Mocked,
} from "vitest";
import type { HandlerContext, StepHandler, StepParameters } from "../src";
import { StartEvent, StopEvent, Workflow, WorkflowEvent } from "../src";

class JokeEvent extends WorkflowEvent<{ joke: string }> {}

class AnalysisEvent extends WorkflowEvent<{ analysis: string }> {}

describe("type system", () => {
  test("handler", () => {
    type Parameters = StepParameters<
      [typeof StartEvent<string>],
      [typeof StopEvent<string>]
    >;
    type Handler = (
      context: HandlerContext,
      ev: StartEvent<string>,
    ) => Promise<StopEvent<string>>;
    type Handler2 = (
      context: HandlerContext,
      ev: StartEvent<string>,
    ) => Promise<StopEvent<number>>;
    type Handler3 = (
      context: HandlerContext,
      ev: StartEvent<string>,
    ) => Promise<AnalysisEvent>;
    expectTypeOf<Parameters>().toEqualTypeOf<{
      inputs: [typeof StartEvent<string>];
      outputs: [typeof StopEvent<string>];
    }>();
    expectTypeOf<
      StepHandler<
        unknown,
        [typeof StartEvent<string>],
        [typeof StopEvent<string>]
      >
    >().toEqualTypeOf<Handler>();
    expectTypeOf<
      StepHandler<
        unknown,
        [typeof StartEvent<string>],
        [typeof StopEvent<string>]
      >
    >().not.toEqualTypeOf<Handler2>();
    expectTypeOf<
      StepHandler<
        unknown,
        [typeof StartEvent<string>],
        [typeof StopEvent<string>]
      >
    >().not.toEqualTypeOf<Handler3>();
  });
});

describe("workflow basic", () => {
  let generateJoke: Mocked<
    (context: HandlerContext, ev: StartEvent) => Promise<JokeEvent>
  >;
  let critiqueJoke: Mocked<
    (context: HandlerContext, ev: JokeEvent) => Promise<StopEvent<string>>
  >;
  let analyzeJoke: Mocked<
    (context: HandlerContext, ev: JokeEvent) => Promise<AnalysisEvent>
  >;

  beforeEach(() => {
    generateJoke = vi.fn(async (_context, _: StartEvent) => {
      return new JokeEvent({ joke: "a joke" });
    });

    critiqueJoke = vi.fn(async (_context, _: JokeEvent) => {
      return new StopEvent("stop");
    });

    analyzeJoke = vi.fn(async (_context: HandlerContext, _: JokeEvent) => {
      return new AnalysisEvent({ analysis: "an analysis" });
    });
  });

  test("workflow basic", async () => {
    const workflow = new Workflow<
      {
        foo: string;
        bar: number;
      },
      string,
      string
    >();
    workflow.addStep(
      {
        inputs: [StartEvent],
        outputs: [StopEvent],
      },
      async ({ data }, start) => {
        expect(start).toBeInstanceOf(StartEvent);
        expect(start.data).toBe("start");
        expect(data.bar).toBe(42);
        expect(data.foo).toBe("foo");
        return new StopEvent("stopped");
      },
    );

    const result = workflow.run("start", {
      foo: "foo",
      bar: 42,
    });
    await result;
  });

  test("run workflow", async () => {
    const jokeFlow = new Workflow<unknown, string, string>({ verbose: true });

    jokeFlow.addStep(
      { inputs: [StartEvent<string>], outputs: [JokeEvent] },
      generateJoke,
    );
    jokeFlow.addStep(
      { inputs: [JokeEvent], outputs: [StopEvent] },
      critiqueJoke,
    );

    const result = await jokeFlow.run("pirates");

    expect(generateJoke).toHaveBeenCalledTimes(1);
    expect(critiqueJoke).toHaveBeenCalledTimes(1);
    expect(result.data).toBe("stop");
  });

  test("stream events", async () => {
    const jokeFlow = new Workflow<unknown, string, string>({ verbose: true });

    jokeFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [JokeEvent],
      },
      generateJoke,
    );
    jokeFlow.addStep(
      {
        inputs: [JokeEvent],
        outputs: [StopEvent],
      },
      critiqueJoke,
    );

    const run = jokeFlow.run("pirates");
    const event = await run[Symbol.asyncIterator]().next(); // get one event to avoid testing timeout
    const result = await run;

    expect(generateJoke).toHaveBeenCalledTimes(1);
    expect(critiqueJoke).toHaveBeenCalledTimes(1);
    expect(result.data).toBe("stop");
    expect(event).not.toBeNull();
  });

  test("workflow timeout", async () => {
    const TIMEOUT = 1;
    const jokeFlow = new Workflow<unknown, string, string>({
      verbose: true,
      timeout: TIMEOUT,
    });

    const longRunning = async (_context: HandlerContext, ev: StartEvent) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
      return new StopEvent("We waited 2 seconds");
    };

    jokeFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent],
      },
      longRunning,
    );
    const run = jokeFlow.run("Let's start");
    await expect(run).rejects.toThrow(
      `Operation timed out after ${TIMEOUT} seconds`,
    );
  });

  test("workflow validation", async () => {
    const jokeFlow = new Workflow<unknown, string, string>({ verbose: true });
    jokeFlow.addStep(
      { inputs: [StartEvent<string>], outputs: [StopEvent] },
      generateJoke,
    );
    jokeFlow.addStep(
      { inputs: [JokeEvent], outputs: [StopEvent] },
      critiqueJoke,
    );
    expect(async () => {
      await jokeFlow.run("pirates").strict();
    }).rejects.toThrow(
      "Step spy returned an unexpected output event JokeEvent",
    );
  });

  test("requireEvents - 1", async () => {
    const jokeFlow = new Workflow<unknown, string, string>({ verbose: true });

    jokeFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent],
      },
      async (ctx, start) => {
        ctx.sendEvent(new AnalysisEvent({ analysis: "an analysis" }));
        await ctx.requireEvent(JokeEvent);
        return new StopEvent("Report generated");
      },
    );

    const fn = vi.fn(async () => {
      return new JokeEvent({ joke: "a joke" });
    });

    jokeFlow.addStep(
      {
        inputs: [AnalysisEvent],
        outputs: [JokeEvent],
      },
      fn,
    );

    const result = await jokeFlow.run("pirates");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.data).toBe("Report generated");
  });

  test("run workflow with multiple in-degree", async () => {
    const jokeFlow = new Workflow<unknown, string, string>({ verbose: true });

    jokeFlow.addStep(
      {
        inputs: [StartEvent],
        outputs: [JokeEvent],
      },
      async (context, _) => {
        context.sendEvent(
          new AnalysisEvent({
            analysis: "an analysis",
          }),
        );
        return new JokeEvent({
          joke: "a joke",
        });
      },
    );
    jokeFlow.addStep(
      {
        inputs: [JokeEvent, AnalysisEvent],
        outputs: [StopEvent<string>],
      },
      async () => {
        return new StopEvent("The analysis is insightful and helpful.");
      },
    );

    const result = await jokeFlow.run("pirates");
    expect(result.data).toBe("The analysis is insightful and helpful.");
  });

  test("run invalid workflow", async () => {
    const jokeFlow = new Workflow<unknown, string, string>({ verbose: true });

    jokeFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [JokeEvent],
      },
      generateJoke,
    );
    jokeFlow.addStep(
      {
        inputs: [JokeEvent],
        outputs: [StopEvent<string>],
      },
      // @ts-expect-error it actually returns AnalysisEvent
      analyzeJoke,
    );
    jokeFlow.addStep(
      {
        inputs: [JokeEvent],
        outputs: [StopEvent<string>],
      },
      async () => {
        return new StopEvent("The analysis is insightful and helpful.");
      },
    );
    const consoleSpy = vi.spyOn(console, "warn");
    expect(consoleSpy).toHaveBeenCalledTimes(0);
    const result = await jokeFlow.run("pirates");
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
    expect(result.data).toBe("The analysis is insightful and helpful.");
  });

  test("run workflow with object-based StartEvent and StopEvent", async () => {
    const objectFlow = new Workflow<
      unknown,
      Person,
      {
        result: {
          greeting: string;
        };
      }
    >({ verbose: true });

    type Person = { name: string; age: number };

    const processObject = vi.fn(async (_context, ev: StartEvent<Person>) => {
      const { name, age } = ev.data;
      return new StopEvent({
        result: { greeting: `Hello ${name}, you are ${age} years old!` },
      });
    });

    objectFlow.addStep(
      {
        inputs: [StartEvent<Person>],
        outputs: [
          StopEvent<{
            result: {
              greeting: string;
            };
          }>,
        ],
      },
      processObject,
    );

    const result = await objectFlow.run(
      new StartEvent<Person>({ name: "Alice", age: 30 }),
    );

    expect(processObject).toHaveBeenCalledTimes(1);
    expect(result.data.result).toEqual({
      greeting: "Hello Alice, you are 30 years old!",
    });
  });

  test("workflow with two concurrent steps", async () => {
    const concurrentFlow = new Workflow<unknown, string, string>({
      verbose: true,
    });

    const step1 = vi.fn(async (_context, _ev: StartEvent) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return new StopEvent("Step 1 completed");
    });

    const step2 = vi.fn(async (_context, _ev: StartEvent) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return new StopEvent("Step 2 completed");
    });

    concurrentFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      step1,
    );
    concurrentFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      step2,
    );

    const startTime = new Date();
    const result = await concurrentFlow.run("start");
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    expect(step1).toHaveBeenCalledTimes(1);
    expect(step2).toHaveBeenCalledTimes(1);
    expect(duration).toBeLessThan(200);
    expect(result.data).toBe("Step 2 completed");
  });

  test("workflow with two concurrent cyclic steps", async () => {
    const concurrentCyclicFlow = new Workflow<unknown, string, string>({
      verbose: true,
    });

    class Step1Event extends WorkflowEvent<{
      result: string;
    }> {}

    class Step2Event extends WorkflowEvent<{
      result: string;
    }> {}

    let step2Count = 0;

    const step1 = vi.fn(async (_context, ev: StartEvent | Step1Event) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return new Step1Event({ result: "Step 1 completed" });
    });

    const step2 = vi.fn(async (_context, ev: StartEvent | Step2Event) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      step2Count++;
      if (step2Count >= 5) {
        return new StopEvent("Step 2 completed 5 times");
      }
      return new Step2Event({ result: "Step 2 completed" });
    });

    concurrentCyclicFlow.addStep(
      {
        inputs: [WorkflowEvent.or(StartEvent<string>, Step1Event)],
        outputs: [Step1Event],
      },
      step1,
    );
    concurrentCyclicFlow.addStep(
      {
        inputs: [WorkflowEvent.or(StartEvent<string>, Step2Event)],
        outputs: [Step2Event, StopEvent],
      },
      step2,
    );

    const startTime = new Date();
    const result = await concurrentCyclicFlow.run("start");
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    expect(step1).toHaveBeenCalledTimes(1);
    expect(step2).toHaveBeenCalledTimes(5);
    expect(duration).toBeGreaterThanOrEqual(500); // At least 5 * 100ms for step2
    expect(duration).toBeLessThan(1000); // Less than 1 second
    expect(result.data).toBe("Step 2 completed 5 times");
  });

  test("sendEvent", async () => {
    const myWorkflow = new Workflow<unknown, string, string>({ verbose: true });

    class QueryEvent extends WorkflowEvent<{ query: string }> {}

    class QueryResultEvent extends WorkflowEvent<{ result: string }> {}

    class PendingEvent extends WorkflowEvent<void> {}

    myWorkflow.addStep(
      {
        inputs: [StartEvent],
        outputs: [PendingEvent],
      },
      async (context: HandlerContext, events) => {
        context.sendEvent(new QueryEvent({ query: "something" }));
        return new PendingEvent();
      },
    );

    myWorkflow.addStep(
      {
        inputs: [QueryEvent],
        outputs: [QueryResultEvent],
      },
      async (context, event) => {
        return new QueryResultEvent({ result: "query result" });
      },
    );

    myWorkflow.addStep(
      {
        inputs: [PendingEvent, QueryResultEvent],
        outputs: [StopEvent<string>],
      },
      async (context, ev0, ev1) => {
        return new StopEvent(ev1.data.result);
      },
    );

    const result = await myWorkflow.run("start");
    expect(result.data).toBe("query result");
  });

  test("requireEvents - 2", async () => {
    const myWorkflow = new Workflow<unknown, string, string>({ verbose: true });

    class QueryEvent extends WorkflowEvent<{ query: string }> {}

    class QueryResultEvent extends WorkflowEvent<{ result: string }> {}

    myWorkflow.addStep(
      {
        inputs: [StartEvent],
        outputs: [StopEvent<string>],
      },
      async (context: HandlerContext) => {
        context.sendEvent(new QueryEvent({ query: "something" }));
        const queryResultEvent = await context.requireEvent(QueryResultEvent);
        return new StopEvent(queryResultEvent.data.result);
      },
    );

    myWorkflow.addStep(
      {
        inputs: [QueryEvent],
        outputs: [QueryResultEvent],
      },
      async (context, event) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return new QueryResultEvent({ result: "query result" });
      },
    );

    const result = await myWorkflow.run("start");
    expect(result.data).toBe("query result");
  });

  test("allow output with send event", async () => {
    const myFlow = new Workflow<unknown, string, string>({ verbose: true });
    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [],
      },
      async (context, ev) => {
        context.sendEvent(new StopEvent(`Hello ${ev.data}!`));
      },
    );
    const result = myFlow.run("world");
    expect((await result).data).toBe("Hello world!");
  });
});

describe("workflow event loop", () => {
  test("basic", async () => {
    const jokeFlow = new Workflow<unknown, string, string>({ verbose: true });

    jokeFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      async (_context, ev: StartEvent) => {
        return new StopEvent(`Hello ${ev.data}!`);
      },
    );

    const result = await jokeFlow.run("world");
    expect(result.data).toBe("Hello world!");
  });

  test("branch", async () => {
    const myFlow = new Workflow<unknown, string, string>({ verbose: true });

    class BranchA1Event extends WorkflowEvent<{ payload: string }> {}

    class BranchA2Event extends WorkflowEvent<{ payload: string }> {}

    class BranchB1Event extends WorkflowEvent<{ payload: string }> {}

    class BranchB2Event extends WorkflowEvent<{ payload: string }> {}

    let control = false;

    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [BranchA1Event, BranchB1Event],
      },
      async (_context, ev) => {
        if (control) {
          return new BranchA1Event({ payload: ev.data });
        } else {
          return new BranchB1Event({ payload: ev.data });
        }
      },
    );

    myFlow.addStep(
      {
        inputs: [BranchA1Event],
        outputs: [BranchA2Event],
      },
      async (_context, ev) => {
        return new BranchA2Event({ payload: ev.data.payload });
      },
    );

    myFlow.addStep(
      {
        inputs: [BranchB1Event],
        outputs: [BranchB2Event],
      },
      async (_context, ev) => {
        return new BranchB2Event({ payload: ev.data.payload });
      },
    );

    myFlow.addStep(
      {
        inputs: [BranchA2Event],
        outputs: [StopEvent<string>],
      },
      async (_context, ev) => {
        return new StopEvent(`Branch A2: ${ev.data.payload}`);
      },
    );

    myFlow.addStep(
      {
        inputs: [BranchB2Event],
        outputs: [StopEvent],
      },
      async (_context, ev) => {
        return new StopEvent(`Branch B2: ${ev.data.payload}`);
      },
    );

    {
      const result = await myFlow.run("world");
      expect(result.data).toMatch(/Branch B2: world/);
    }

    control = true;

    {
      const result = await myFlow.run("world");
      expect(result.data).toMatch(/Branch A2: world/);
    }

    {
      const context = myFlow.run("world");
      for await (const event of context) {
        if (event instanceof BranchA2Event) {
          expect(event.data.payload).toBe("world");
        }
        if (event instanceof StopEvent) {
          expect(event.data).toMatch(/Branch A2: world/);
        }
      }
    }
  });

  test("one event have multiple outputs", async () => {
    const myFlow = new Workflow<unknown, string, string>({ verbose: true });

    class AEvent extends WorkflowEvent<{ payload: string }> {}

    class BEvent extends WorkflowEvent<{ payload: string }> {}

    class CEvent extends WorkflowEvent<{ payload: string }> {}

    class DEvent extends WorkflowEvent<{ payload: string }> {}

    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      async (_context, ev) => {
        return new StopEvent("STOP");
      },
    );

    const fn = vi.fn(async (_context, ev: StartEvent) => {
      return new AEvent({ payload: ev.data });
    });

    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [AEvent],
      },
      fn,
    );
    myFlow.addStep(
      {
        inputs: [AEvent],
        outputs: [BEvent, CEvent],
      },
      async (_context, ev: AEvent) => {
        return new BEvent({ payload: ev.data.payload });
      },
    );
    myFlow.addStep(
      {
        inputs: [AEvent],
        outputs: [CEvent],
      },
      async (_context, ev: AEvent) => {
        return new CEvent({ payload: ev.data.payload });
      },
    );
    myFlow.addStep(
      {
        inputs: [BEvent],
        outputs: [DEvent],
      },
      async (_context, ev: BEvent) => {
        return new DEvent({ payload: ev.data.payload });
      },
    );
    myFlow.addStep(
      {
        inputs: [CEvent],
        outputs: [DEvent],
      },
      async (_context, ev: CEvent) => {
        return new DEvent({ payload: ev.data.payload });
      },
    );
    myFlow.addStep(
      {
        inputs: [DEvent],
        outputs: [StopEvent<string>],
      },
      async (_context, ev: DEvent) => {
        return new StopEvent(`Hello ${ev.data.payload}!`);
      },
    );

    const result = await myFlow.run("world");
    expect(result.data).toBe("STOP");
    expect(fn).toHaveBeenCalledTimes(1);

    // streaming events will allow to consume event even stop event is reached
    const stream = myFlow.run("world");
    for await (const _ of stream) {
      /* empty */
    }
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("run with custom context", async () => {
    type MyContext = { name: string };
    const myFlow = new Workflow<MyContext, string, string>({ verbose: true });
    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      async ({ data }, _: StartEvent) => {
        return new StopEvent(`Hello ${data.name}!`);
      },
    );

    const result = await myFlow.run("world", { name: "Alice" });
    expect(result.data).toBe("Hello Alice!");
  });

  test("run with custom context with two streaming", async () => {
    type MyContext = { name: string };
    const myFlow = new Workflow<MyContext, string, string>({ verbose: true });
    myFlow.addStep(
      {
        inputs: [StartEvent],
        outputs: [StopEvent],
      },
      async ({ data }, _) => {
        if (data == null) {
          return new StopEvent({ result: "EMPTY" });
        }
        return new StopEvent({ result: `Hello ${data.name}!` });
      },
    );

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

  test("workflow multiple output", async () => {
    const myFlow = new Workflow<unknown, string, string>({ verbose: true });
    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>, StopEvent<string>],
      },
      async (_context, ev) => {
        return new StopEvent(`Hello ${ev.data}!`);
      },
    );
    const result = await myFlow.run("world").strict();
    expect(result.data).toBe("Hello world!");
  });
});

describe("snapshot", async () => {
  test("snapshot and recover", async () => {
    const myFlow = new Workflow({ verbose: true });
    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      async (_, ev: StartEvent) => {
        return new StopEvent(`Hello ${ev.data}!`);
      },
    );
    const context = myFlow.run("world");
    const arrayBuffer = context.snapshot();
    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    const context2 = await myFlow.recover(arrayBuffer);
    expect(context2.data).toBe("Hello world!");
  });

  test("snapshot in middle of workflow run ", async () => {
    const myFlow = new Workflow<
      {
        value: number;
      },
      string,
      string
    >({ verbose: true });

    class AEvent extends WorkflowEvent<{ payload: string }> {}

    const fn = vi.fn(async (_, ev: StartEvent) => {
      return new AEvent({ payload: ev.data });
    });

    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [AEvent],
      },
      fn,
    );

    myFlow.addStep(
      {
        inputs: [AEvent],
        outputs: [StopEvent],
      },
      async ({ data }, _: AEvent) => {
        return new StopEvent(`Hello ${data.value}!`);
      },
    );

    const context = myFlow.run("world", {
      value: 1,
    });
    for await (const event of context) {
      if (event instanceof AEvent) {
        expect(fn).toHaveBeenCalledTimes(1);
        const arrayBuffer = context.snapshot();
        expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
        const context2 = await myFlow.recover(arrayBuffer).with({
          value: 2,
        });
        expect(context2.data).toBe("Hello 2!");
        break;
      }
      if (event instanceof StopEvent) {
        expect(event.data).toBe("Hello 1!");
      }
    }
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("error", () => {
  test("error in handler", async () => {
    const myFlow = new Workflow<boolean, string, string>({ verbose: true });
    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      async ({ data }) => {
        if (!data) {
          throw new Error("Something went wrong");
        } else {
          return new StopEvent(`Hello ${data}!`);
        }
      },
    );
    await expect(myFlow.run("world")).rejects.toThrow("Something went wrong");
    {
      const context = myFlow.run("world");
      try {
        for await (const _ of context) {
          // do nothing
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Something went wrong");
        const snapshot = context.snapshot();
        const newContext = myFlow.recover(snapshot).with(true);
        expect((await newContext).data).toBe("Hello true!");
      }
    }
  });

  test("recover in the middle of workflow", async () => {
    const myFlow = new Workflow<string | undefined, string, string>({
      verbose: true,
    });

    class AEvent extends WorkflowEvent<string> {}

    myFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [AEvent],
      },
      async ({ data }) => {
        if (data !== undefined) {
          throw new Error("Something went wrong");
        }
        return new AEvent("world");
      },
    );
    myFlow.addStep(
      {
        inputs: [AEvent],
        outputs: [StopEvent],
      },
      async ({ data }, ev) => {
        if (data === undefined) {
          throw new Error("Something went wrong");
        }
        return new StopEvent(`Hello, ${data}!`);
      },
    );
    // no context, so will throw error
    const context = myFlow.run("world");
    try {
      for await (const _ of context) {
        // do nothing
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Something went wrong");
      const snapshot = context.snapshot();
      const newContext = myFlow.recover(snapshot).with("Recovered Data");
      expect((await newContext).data).toBe("Hello, Recovered Data!");
    }
  });
});
