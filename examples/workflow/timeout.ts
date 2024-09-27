import {
  ContextInStep,
  StartEvent,
  StopEvent,
  Workflow,
} from "@llamaindex/core/workflow";

const longRunning = async (_context: ContextInStep, ev: StartEvent) => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
  return new StopEvent({ result: "We waited 2 seconds" });
};

async function timeout() {
  const workflow = new Workflow({ verbose: true, timeout: 1 });
  workflow.addStep(StartEvent, longRunning);
  // This will timeout
  try {
    await workflow.run("Let's start");
  } catch (error) {
    console.error(error);
  }
}

async function notimeout() {
  // Increase timeout to 3 seconds - no timeout
  const workflow = new Workflow({ verbose: true, timeout: 3 });
  workflow.addStep(StartEvent, longRunning);
  const result = await workflow.run("Let's start");
  console.log(result.data.result);
}

async function main() {
  await timeout();
  await notimeout();
}

main().catch(console.error);
