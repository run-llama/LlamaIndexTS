import { StartEvent, StopEvent, Workflow } from "llamaindex";

const longRunning = async (_: unknown, ev: StartEvent<string>) => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
  return new StopEvent("We waited 2 seconds");
};

async function timeout() {
  const workflow = new Workflow<unknown, string, string>({
    timeout: 1,
  });
  workflow.addStep(
    {
      inputs: [StartEvent<string>],
      outputs: [StopEvent<string>],
    },
    longRunning,
  );
  try {
    await workflow.run("Let's start");
  } catch (error) {
    console.error(error);
  }
}

async function notimeout() {
  // Increase timeout to 3 seconds - no timeout
  const workflow = new Workflow<unknown, string, string>({
    timeout: 3,
  });
  workflow.addStep(
    {
      inputs: [StartEvent<string>],
      outputs: [StopEvent<string>],
    },
    longRunning,
  );
  const result = await workflow.run("Let's start");
  console.log(result.data);
}

async function main() {
  await timeout();
  console.log("---");
  await notimeout();
}

main().catch(console.error);
