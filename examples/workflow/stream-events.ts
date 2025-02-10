import { OpenAI } from "@llamaindex/openai";
import {
  HandlerContext,
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";

// Create LLM instance
const llm = new OpenAI();

// Create custom event types
export class JokeEvent extends WorkflowEvent<{ joke: string }> {}

export class MessageEvent extends WorkflowEvent<{ msg: string }> {}

const generateJoke = async (context: HandlerContext, ev: StartEvent) => {
  context.sendEvent(
    new MessageEvent({ msg: `Generating a joke about: ${ev.data}` }),
  );
  const prompt = `Write your best joke about ${ev.data}.`;
  const response = await llm.complete({ prompt });
  return new JokeEvent({ joke: response.text });
};

const critiqueJoke = async (context: HandlerContext, ev: JokeEvent) => {
  context.sendEvent(
    new MessageEvent({ msg: `Write a critique of this joke: ${ev.data.joke}` }),
  );
  const prompt = `Give a thorough critique of the following joke: ${ev.data.joke}`;
  const response = await llm.complete({ prompt });
  return new StopEvent(response.text);
};

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

// Usage
async function main() {
  const run = jokeFlow.run("pirates");
  for await (const event of run) {
    if (event instanceof MessageEvent) {
      console.log("Message:");
      console.log((event as MessageEvent).data.msg);
    } else if (event instanceof StopEvent) {
      console.log("Result:");
      console.log((event as StopEvent<string>).data);
    }
  }
}

main().catch(console.error);
