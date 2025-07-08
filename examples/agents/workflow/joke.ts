import { openai } from "@llamaindex/openai";
import { createWorkflow, workflowEvent } from "@llamaindex/workflow-core";
import { createStatefulMiddleware } from "@llamaindex/workflow-core/middleware/state";

// Create LLM instance
const llm = openai({ model: "gpt-4.1-mini" });

// Define our workflow events
const startEvent = workflowEvent<string>(); // Input topic for joke
const jokeEvent = workflowEvent<{ joke: string }>(); // Intermediate joke
const critiqueEvent = workflowEvent<{ joke: string; critique: string }>(); // Intermediate critique
const resultEvent = workflowEvent<{ joke: string; critique: string }>(); // Final joke + critique

// Create our workflow
const { withState, getContext } = createStatefulMiddleware(() => ({
  numIterations: 0,
  maxIterations: 3,
}));
const jokeFlow = withState(createWorkflow());

// Define handlers for each step
jokeFlow.handle([startEvent], async (event: startEvent) => {
  // Prompt the LLM to write a joke
  const prompt = `Write your best joke about ${event.data}. Write the joke between <joke> and </joke> tags.`;
  const response = await llm.complete({ prompt });

  // Parse the joke from the response
  const joke =
    response.text.match(/<joke>([\s\S]*?)<\/joke>/)?.[1]?.trim() ??
    response.text;
  return jokeEvent.with({ joke: joke });
});

jokeFlow.handle([jokeEvent], async (event) => {
  // Prompt the LLM to critique the joke
  const prompt = `Give a thorough critique of the following joke. If the joke needs improvement, put "IMPROVE" somewhere in the critique: ${event.data.joke}`;
  const response = await llm.complete({ prompt });

  // If the critique includes "IMPROVE", keep iterating, else, return the result
  if (response.text.includes("IMPROVE")) {
    return critiqueEvent.with({
      joke: event.data.joke,
      critique: response.text,
    });
  }

  return resultEvent.with({ joke: event.data.joke, critique: response.text });
});

jokeFlow.handle([critiqueEvent], async (event) => {
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
  sendEvent(startEvent.with("pirates"));

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
