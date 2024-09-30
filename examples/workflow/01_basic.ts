import { StartEvent, StopEvent, Workflow } from "@llamaindex/core/workflow";
import { OpenAI } from "@llamaindex/openai";

const myWorkflow = new Workflow({
  verbose: true,
});

const openai = new OpenAI();

myWorkflow.addStep(StartEvent, async (_, event) => {
  const { input } = event.data;
  const response = await openai.complete({
    prompt: `Translate English to French: ${input}`,
  });
  return new StopEvent({
    result: response.text,
  });
});

const { data } = await myWorkflow.run("Hello, world!");

console.log("Result:", data.result);
