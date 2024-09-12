import {
  Context,
  createEventType,
  StartEvent,
  StopEvent,
  Workflow,
} from "@llamaindex/core/workflow";
import { OpenAI } from "llamaindex";

// Create LLM instance
const llm = new OpenAI();

// Create a custom event type
const JokeEvent = createEventType<{ joke: string }>();
type JokeEvent = InstanceType<typeof JokeEvent>;

const generateJoke = async (_context: Context, ev: StartEvent) => {
  const prompt = `Write your best joke about ${ev.input}.`;
  const response = await llm.complete({ prompt });
  return new JokeEvent({ joke: response.text });
};

const critiqueJoke = async (_context: Context, ev: JokeEvent) => {
  const prompt = `Give a thorough critique of the following joke: ${ev.joke}`;
  const response = await llm.complete({ prompt });
  return new StopEvent({ result: response.text });
};

const jokeFlow = new Workflow({ verbose: true });
jokeFlow.addStep(StartEvent, generateJoke);
jokeFlow.addStep(JokeEvent, critiqueJoke);

// Usage
async function main() {
  const result = await jokeFlow.run("pirates");
  console.log(result.result);
}

main().catch(console.error);
