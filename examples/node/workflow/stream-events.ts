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

// Create custom event types
export class JokeEvent extends WorkflowEvent<{ joke: string }> {}
export class MessageEvent extends WorkflowEvent<{ msg: string }> {}

const generateJoke = async (context: Context, ev: StartEvent) => {
  context.writeEventToStream(
    new MessageEvent({ msg: `Generating a joke about: ${ev.data.input}` }),
  );
  const prompt = `Write your best joke about ${ev.data.input}.`;
  const response = await llm.complete({ prompt });
  return new JokeEvent({ joke: response.text });
};

const critiqueJoke = async (context: Context, ev: JokeEvent) => {
  context.writeEventToStream(
    new MessageEvent({ msg: `Write a critique of this joke: ${ev.data.joke}` }),
  );
  const prompt = `Give a thorough critique of the following joke: ${ev.data.joke}`;
  const response = await llm.complete({ prompt });
  return new StopEvent({ result: response.text });
};

const jokeFlow = new Workflow();
jokeFlow.addStep(StartEvent, generateJoke);
jokeFlow.addStep(JokeEvent, critiqueJoke);

// Usage
async function main() {
  const run = jokeFlow.run("pirates");
  for await (const event of jokeFlow.streamEvents()) {
    console.log((event as MessageEvent).data.msg);
  }
  const result = await run;
  console.log(result.data.result);
}

main().catch(console.error);
