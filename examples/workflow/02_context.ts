import { StartEvent, StopEvent, Workflow } from "@llamaindex/core/workflow";
import { OpenAI } from "@llamaindex/openai";
import { createInterface } from "readline/promises";

const myWorkflow = new Workflow({
  verbose: true,
}).with({
  llm: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  }),
});

myWorkflow.addStep(StartEvent, async (context, event) => {
  const { llm } = context;
  const { input } = event.data;
  const response = await llm.complete({
    prompt: `Translate English to French: ${input}`,
  });
  return new StopEvent({
    result: response.text,
  });
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const input = await rl.question("Input word or phrase: ");

const { data } = await myWorkflow.run(input);

console.log("Result:", data.result);

rl.close();
