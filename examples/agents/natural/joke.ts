import { openai } from "@llamaindex/openai";
import { agentHandler, createWorkflow, zodEvent } from "@llamaindex/workflow";
import { Settings } from "llamaindex";
import { z } from "zod";

// Create LLM instance
const llm = openai({ model: "gpt-4.1-mini" });
Settings.llm = llm;

// Define our workflow events
const writeJokeSchema = z.object({
  description: z
    .string()
    .describe("The topic to write a joke or describe the joke to improve."),
  writtenJoke: z.optional(z.string()).describe("The written joke."),
  retriedTimes: z
    .optional(z.number().default(0))
    .describe("The retried times for writing the joke."),
});

const critiqueSchema = z.object({
  joke: z.string().describe("The joke to critique"),
  retriedTimes: z.number().describe("The retried times for writing the joke."),
});

const finalResultSchema = z.object({
  joke: z.string().describe("The joke to critique"),
  critique: z.string().describe("The critique of the joke"),
});

const writeJokeEvent = zodEvent(writeJokeSchema, {
  debugLabel: "writeJokeEvent",
}); // Input topic for writing a joke
const critiqueEvent = zodEvent(critiqueSchema, {
  debugLabel: "critiqueEvent",
}); // Ask for critique of the joke
const finalResultEvent = zodEvent(finalResultSchema, {
  debugLabel: "finalResultEvent",
}); // Final result

// Create our workflow
const jokeFlow = createWorkflow();

// Define handlers for each step
// This step always write a joke based on the description
jokeFlow.handle(
  [writeJokeEvent],
  agentHandler({
    instructions: `You are a joke writer. You are given a topic and you need to write a joke about it.`,
    results: [critiqueEvent],
  }),
);

// This step critiques the joke and asks the writer to improve the joke or send a final result event for stopping.
jokeFlow.handle(
  [critiqueEvent],
  agentHandler({
    instructions: `
You are given a joke and you need to critique it. Follow the following guidelines:
1. You have maximum 3 times to improve the joke.
2. If the joke is not good, increase the retriedTimes, describe how to improve the joke and send a writeJokeEvent.
3. If the joke is good, trigger the finalResultEvent event.
`,
    results: [writeJokeEvent, finalResultEvent],
  }),
);

// Usage
async function main() {
  const { stream, sendEvent } = jokeFlow.createContext();
  sendEvent(writeJokeEvent.with({ description: "write a joke about llama" }));

  await stream.until(finalResultEvent).forEach((event) => {
    if (writeJokeEvent.include(event)) {
      console.log(
        "Triggering write joke: ",
        JSON.stringify(event.data, null, 2),
      );
    } else if (critiqueEvent.include(event)) {
      console.log("Written joke:  ", JSON.stringify(event.data, null, 2));
    } else if (finalResultEvent.include(event)) {
      console.log("Output: ", JSON.stringify(event.data, null, 2));
    } else {
      console.log("Unknown event: ", JSON.stringify(event.data, null, 2));
    }
  });
  console.log("Done");
}

main().catch(console.error);
