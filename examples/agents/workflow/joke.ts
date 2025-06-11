import { Settings } from "@llamaindex/core/global";
import { openai } from "@llamaindex/openai";
import {
  createStatefulMiddleware,
  createWorkflow,
  handleWithAgent,
  workflowEvent,
  zodEvent,
} from "@llamaindex/workflow";
import { z } from "zod";

// Create LLM instance
const llm = openai({ model: "gpt-4.1-mini" });
Settings.llm = llm;

// Define our workflow events
const critiqueSchema = z
  .object({
    joke: z.string().describe("The joke to critique"),
    critique: z.string().describe("The critique of the joke"),
  })
  .describe(
    "The critique of the joke. Return the critique in the same language as the joke.",
  );

const jokeSchema = z.object({
  joke: z.string().describe("A joke about the topic"),
});

const startEvent = workflowEvent<string>(); // Input topic for joke
const jokeEvent = zodEvent(jokeSchema); // Intermediate joke
const critiqueEvent = zodEvent(critiqueSchema); // Critique for the joke
const resultEvent = workflowEvent<{ joke: string; critique: string }>(); // Final joke + critique

// Create our workflow
const { withState, getContext } = createStatefulMiddleware(() => ({
  numIterations: 0,
  maxIterations: 3,
}));
const jokeFlow = withState(createWorkflow());

// Define handlers for each step
jokeFlow.handle(
  [startEvent],
  handleWithAgent({
    handlePrompt: `You are a joke writer. You are given a topic and you need to write a joke about it.`,
    returnEvent: jokeEvent,
  }),
);

jokeFlow.handle(
  [jokeEvent],
  handleWithAgent({
    handlePrompt: `You are a joke critic. You are given a joke and you need to critique it.`,
    returnEvent: critiqueEvent,
  }),
);

jokeFlow.handle([critiqueEvent], async (event) => {
  // We cannot use agent here because this handler could return either a joke or a result event
  // TODO: Support this in the future
  console.log("[Critique Event]: ", JSON.stringify(event.data));
  // Keep track of the number of iterations
  const state = getContext().state;
  state.numIterations++;

  // Write a new joke based on the previous joke and critique
  const prompt = `Write a new joke based on the following critique and the original joke. Write the joke between <joke> and </joke> tags.\n\nJoke: ${event.data.joke}\n\nCritique: ${event.data.critique}`;
  const response = await llm.complete({ prompt });

  // Parse the joke from the response
  const joke =
    response.text.match(/<joke>([\s\S]*?)<\/joke>/)?.[1]?.trim() ??
    response.text;

  // If we've done less than the max number of iterations, keep iterating
  // else, return the result
  if (state.numIterations < state.maxIterations) {
    return jokeEvent.with({ joke: joke });
  }

  return resultEvent.with({ joke: joke, critique: event.data.critique });
});

// Usage
async function main() {
  const { stream, sendEvent } = jokeFlow.createContext();
  sendEvent(startEvent.with("llama"));

  let result: { joke: string; critique: string } | undefined;

  for await (const event of stream) {
    // console.log(event.data);  optionally log the event data
    if (resultEvent.include(event)) {
      result = event.data;
      break; // Stop when we get the final result
    }
  }

  console.log(result);
}

main().catch(console.error);
