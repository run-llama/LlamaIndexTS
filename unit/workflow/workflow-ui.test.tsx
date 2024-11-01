import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";
import type { ReactNode } from "react";
import { describe, expect, test } from "vitest";

describe("workflow integration", () => {
  type Context = {
    pending: string[];
  };
  type Start = string;
  type Stop = ReactNode;

  test("nodejs", async () => {
    const workflow = new Workflow<never, Start, Stop>({
      wait: async () => await new Promise((resolve) => setTimeout(resolve, 0)),
    });
    workflow.addStep(
      {
        inputs: [StartEvent],
        outputs: [StopEvent],
      },
      async (_, __) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return new StopEvent("hello");
      },
    );

    console.log("start");

    const run = workflow.run("start");
    await run.then((stop) => {
      expect(stop.data).toBe("hello");
    });
  });

  test("with jsx", async () => {
    const workflow = new Workflow<never, Start, Stop>();
    workflow.addStep(
      {
        inputs: [StartEvent],
        outputs: [StopEvent],
      },
      async (_, __) => {
        return new StopEvent(<div>Hey there!</div>);
      },
    );

    const run = workflow.run("start");
    const stop = await run;
    expect(stop.data).toEqual(<div>Hey there!</div>);
  });

  test("with message channel", async () => {
    const workflow = new Workflow<Context, Start, Stop>();

    class AnalysisStartEvent extends WorkflowEvent<string> {}

    class AnalysisStopEvent extends WorkflowEvent<string> {}

    workflow.addStep(
      {
        inputs: [StartEvent],
        outputs: [StopEvent],
      },
      async ({ data, sendEvent, requireEvent }) => {
        data.pending.push("analyzing");
        sendEvent(new AnalysisStartEvent("analysis my document"));
        const event = await requireEvent(AnalysisStopEvent);
        await new Promise((resolve) => setTimeout(resolve, 100));
        data.pending.push("analysis complete");
        return new StopEvent(event.data);
      },
    );

    workflow.addStep(
      {
        inputs: [AnalysisStartEvent],
        outputs: [AnalysisStopEvent],
      },
      async ({ data }) => {
        data.pending.push("loading document");
        await new Promise((resolve) => setTimeout(resolve, 100));
        data.pending.push("document loaded");
        return new AnalysisStopEvent("analysis complete");
      },
    );

    const run = workflow.run("start").with({
      pending: [],
    });
    await run;
    expect(run.data.pending).toEqual([
      "analyzing",
      "loading document",
      "document loaded",
      "analysis complete",
    ]);
  });
});
