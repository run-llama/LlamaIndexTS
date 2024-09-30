import type { LLM } from "@llamaindex/core/llms";
import { StartEvent, StopEvent, Workflow } from "@llamaindex/core/workflow";
import { Ollama } from "@llamaindex/ollama";
import { OpenAI } from "@llamaindex/openai";
import { createInterface } from "readline/promises";

const myWorkflow = new Workflow({
  verbose: false,
}).with({
  llm: null! as LLM,
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

const emptyRunner = myWorkflow.run(input);

const openaiResult = emptyRunner.with({
  llm: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  }),
});

const ollamaResult = emptyRunner.with({
  llm: new Ollama({
    model: "llama3.1",
  }),
});

{
  const { data } = await openaiResult;
  console.log("OpenAI Result:", data.result);
}

{
  const { data } = await ollamaResult;
  console.log("Ollama3.1 Result:", data.result);
}

rl.close();
