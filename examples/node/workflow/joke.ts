import {
  Context,
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/core/workflow";
import { OpenAI } from "llamaindex";

// Create LLM instance
const llm = new OpenAI();

// Create a custom event type
export class JokeEvent extends WorkflowEvent<{ joke: string }> {}

const generateJoke = async (_context: Context, ev: StartEvent) => {
  const prompt = `Write your best joke about ${ev.data.input}.`;
  const response = await llm.complete({ prompt });
  return new JokeEvent({ joke: response.text });
};

const critiqueJoke = async (_context: Context, ev: JokeEvent) => {
  const prompt = `Give a thorough critique of the following joke: ${ev.data.joke}`;
  const response = await llm.complete({ prompt });
  return new StopEvent({ result: response.text });
};

const jokeFlow = new Workflow({ verbose: true });
jokeFlow.addStep(StartEvent, generateJoke);
jokeFlow.addStep(JokeEvent, critiqueJoke);

// Usage
async function main() {
  const result = await jokeFlow.run("pirates");
  console.log(result.data.result);
}

main().catch(console.error);
