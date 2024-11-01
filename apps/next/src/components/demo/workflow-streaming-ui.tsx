"use client";
import FlowInput from "@/components/flow-input";
import { Button } from "@/components/ui/button";
import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";
import { ReactNode, startTransition, useState } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

class ComputeEvent extends WorkflowEvent<number> {
  constructor(data: number) {
    super(data);
  }
}

class ComputeResultEvent extends WorkflowEvent<number> {
  constructor(data: number) {
    super(data);
  }
}

type ContextData = {
  sum: number;
};

const workflow = new Workflow<ContextData, number, number>();

const max = 1000;
const min = 100;

workflow.addStep(
  {
    inputs: [StartEvent<number>],
    outputs: [StopEvent<number>],
  },
  async (context, event) => {
    const total = event.data;
    for (let i = 0; i < total; i++) {
      context.sendEvent(new ComputeEvent(i));
    }
    console.log("waiting");
    const computeResults = await Promise.all(
      Array.from({ length: total }).map(() =>
        context.requireEvent(ComputeResultEvent),
      ),
    );
    context.data.sum = computeResults.reduce(
      (acc, result) => acc + result.data,
      0,
    );
    console.log("stop");
    return new StopEvent(context.data.sum);
  },
);

workflow.addStep(
  {
    inputs: [ComputeEvent],
    outputs: [ComputeResultEvent],
  },
  async (context, event) => {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)),
    );
    return new ComputeResultEvent(event.data);
  },
);

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <button
        className="absolute i-ph-arrow-circle-down-fill text-4xl rounded-lg left-[50%] translate-x-[-50%] bottom-0"
        onClick={() => scrollToBottom()}
      />
    )
  );
}

export function WorkflowStreamingDemo() {
  const [ui, setUI] = useState<ReactNode[]>([
    <div key={0} className="bg-gray-100">
      Waiting for workflow to start
    </div>,
  ]);
  const [total, setTotal] = useState<number>(10);

  return (
    <div className="flex flex-col items-start w-full gap-2">
      <div className="flex flex-row justify-center items-center">
        <div className="text-lg mr-2">Compute total</div>{" "}
        <FlowInput value={total} onChange={(value) => setTotal(value)} />
      </div>
      <Button
        onClick={async () => {
          startTransition(() => {
            setUI([]);
          });
          const context = workflow.run(total, {
            sum: 0,
          });
          let i = 0;
          for await (const event of context) {
            console.log(event);
            if (event instanceof ComputeEvent) {
              setUI((ui) => [
                ...ui,
                <div key={i++} className="bg-yellow-100">
                  Computing task id: {event.data}
                </div>,
              ]);
            } else if (event instanceof ComputeResultEvent) {
              setUI((ui) => [
                ...ui,
                <div key={i++} className="bg-green-100">
                  Computed task id: {event.data}
                </div>,
              ]);
            } else if (event instanceof StartEvent) {
              setUI((ui) => [
                ...ui,
                <div key={i++} className="bg-blue-100">
                  Started workflow with total {event.data}
                </div>,
              ]);
            } else if (event instanceof StopEvent) {
              setUI((ui) => [
                ...ui,
                <div key={i++} className="bg-red-100">
                  Workflow stopped
                </div>,
              ]);
            }
          }
        }}
      >
        Start Workflow
      </Button>
      <StickToBottom className="w-full flex flex-col gap-2 p-2 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        <StickToBottom.Content className="flex flex-col gap-2">
          {ui}
        </StickToBottom.Content>
        <ScrollToBottom />
      </StickToBottom>
    </div>
  );
}
