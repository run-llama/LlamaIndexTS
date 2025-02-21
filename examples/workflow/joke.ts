import { OpenAI } from "@llamaindex/openai";
import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";

// Create LLM instance
const llm = new OpenAI();

// Create a custom event type
export class JokeEvent extends WorkflowEvent<{ joke: string }> {}

const generateJoke = async (_: unknown, ev: StartEvent<string>) => {
  const prompt = `Write your best joke about ${ev.data}.`;
  const response = await llm.complete({ prompt });
  return new JokeEvent({ joke: response.text });
};

const critiqueJoke = async (_: unknown, ev: JokeEvent) => {
  const prompt = `Give a thorough critique of the following joke: ${ev.data.joke}`;
  const response = await llm.complete({ prompt });
  return new StopEvent(response.text);
};

const jokeFlow = new Workflow<unknown, string, string>();
jokeFlow.addStep(
  {
    inputs: [StartEvent<string>],
    outputs: [JokeEvent],
  },
  generateJoke,
);
jokeFlow.addStep(
  {
    inputs: [JokeEvent],
    outputs: [StopEvent<string>],
  },
  critiqueJoke,
);

// Usage
async function main() {
  const result = await jokeFlow.run("pirates");
  console.log(result.data);
}

main().catch(console.error);
