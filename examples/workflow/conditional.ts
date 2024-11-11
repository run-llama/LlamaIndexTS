import {
  HandlerContext,
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/workflow";
import { OpenAI } from "llamaindex";

// Create LLM instance
const llm = new OpenAI();

// Create custom event types
export class JokeEvent extends WorkflowEvent<{ joke: string }> {}

export class CritiqueEvent extends WorkflowEvent<{ critique: string }> {}

export class AnalysisEvent extends WorkflowEvent<{ analysis: string }> {}

const generateJoke = async (_: unknown, ev: StartEvent<string>) => {
  const prompt = `Write your best joke about ${ev.data}.`;
  const response = await llm.complete({ prompt });
  return new JokeEvent({ joke: response.text });
};

const critiqueJoke = async (_: unknown, ev: JokeEvent) => {
  const prompt = `Give a thorough critique of the following joke: ${ev.data.joke}`;
  const response = await llm.complete({ prompt });
  return new CritiqueEvent({ critique: response.text });
};

const analyzeJoke = async (_: unknown, ev: JokeEvent) => {
  const prompt = `Give a thorough analysis of the following joke: ${ev.data.joke}`;
  const response = await llm.complete({ prompt });
  return new AnalysisEvent({ analysis: response.text });
};

const reportJoke = async (
  context: HandlerContext,
  ev1: AnalysisEvent,
  ev2: CritiqueEvent,
) => {
  const subPrompts = [ev1.data.analysis, ev2.data.critique];

  const prompt = `Based on the following information about a joke:\n${subPrompts.join(
    "\n",
  )}\nProvide a comprehensive report on the joke's quality and impact.`;
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
    outputs: [CritiqueEvent],
  },
  critiqueJoke,
);
jokeFlow.addStep(
  {
    inputs: [JokeEvent],
    outputs: [AnalysisEvent],
  },
  analyzeJoke,
);
jokeFlow.addStep(
  {
    inputs: [AnalysisEvent, CritiqueEvent],
    outputs: [StopEvent<string>],
  },
  reportJoke,
);

// Usage
async function main() {
  const result = await jokeFlow.run("pirates");
  console.log(result.data);
}

main().catch(console.error);
