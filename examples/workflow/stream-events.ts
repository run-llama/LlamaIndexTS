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
const MessageEvent = createEventType<{ msg: string }>();
type MessageEvent = InstanceType<typeof MessageEvent>;

const generateJoke = async (context: Context, ev: StartEvent) => {
  context.writeEventToStream(
    new MessageEvent({ msg: `Generating a joke about: ${ev.input}` }),
  );
  const prompt = `Write your best joke about ${ev.input}.`;
  const response = await llm.complete({ prompt });
  return new JokeEvent({ joke: response.text });
};

const critiqueJoke = async (context: Context, ev: JokeEvent) => {
  context.writeEventToStream(
    new MessageEvent({ msg: `Write a critique of this joke: ${ev.joke}` }),
  );
  const prompt = `Give a thorough critique of the following joke: ${ev.joke}`;
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
    console.log((event as MessageEvent).msg);
  }
  const result = await run;
  console.log(result.result);
}

main().catch(console.error);
