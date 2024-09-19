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

async function validateFails() {
  try {
    const jokeFlow = new Workflow({ verbose: true, validate: true });
    jokeFlow.addStep(StartEvent, generateJoke, { outputs: StopEvent });
    jokeFlow.addStep(JokeEvent, critiqueJoke, { outputs: StopEvent });
    await jokeFlow.run("pirates");
  } catch (e) {
    console.error("Validation failed:", e);
  }
}

async function validate() {
  const jokeFlow = new Workflow({ verbose: true, validate: true });
  jokeFlow.addStep(StartEvent, generateJoke, { outputs: JokeEvent });
  jokeFlow.addStep(JokeEvent, critiqueJoke, { outputs: StopEvent });
  const result = await jokeFlow.run("pirates");
  console.log(result.data.result);
}

// Usage
async function main() {
  await validateFails();
  await validate();
}

main().catch(console.error);
