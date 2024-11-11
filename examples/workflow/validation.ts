import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";
import { OpenAI } from "llamaindex";

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

async function validateFails() {
  try {
    const jokeFlow = new Workflow();
    jokeFlow.addStep(
      {
        inputs: [StartEvent<string>],
        outputs: [StopEvent<string>],
      },
      // @ts-expect-error outputs should be JokeEvent
      generateJoke,
    );
    jokeFlow.addStep(
      {
        inputs: [JokeEvent],
        outputs: [StopEvent],
      },
      critiqueJoke,
    );
    await jokeFlow.run("pirates").strict();
  } catch (e) {
    console.error("Validation failed:", e);
  }
}

async function validate() {
  const jokeFlow = new Workflow();
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
  const result = await jokeFlow.run("pirates").strict();
  console.log(result.data);
}

// Usage
async function main() {
  await validateFails();
  console.log("---");
  await validate();
}

main().catch(console.error);
