import {
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
export class CritiqueEvent extends WorkflowEvent<{ critique: string }> {}
export class AnalysisEvent extends WorkflowEvent<{ analysis: string }> {}

const generateJoke = async (_: unknown, ev: StartEvent) => {
  const prompt = `Write your best joke about ${ev.data.input}.`;
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
  _: unknown,
  ...events: [AnalysisEvent, CritiqueEvent]
) => {
  const subPrompts = events.map((event) => {
    if (event instanceof AnalysisEvent) {
      return `Analysis: ${event.data.analysis}`;
    } else if (event instanceof CritiqueEvent) {
      return `Critique: ${event.data.critique}`;
    }
    return "";
  });

  const prompt = `Based on the following information about a joke:\n${subPrompts.join("\n")}\nProvide a comprehensive report on the joke's quality and impact.`;
  const response = await llm.complete({ prompt });
  return new StopEvent({ result: response.text });
};

const jokeFlow = new Workflow();
jokeFlow.addStep(StartEvent, generateJoke);
jokeFlow.addStep(JokeEvent, critiqueJoke);
jokeFlow.addStep(JokeEvent, analyzeJoke);
jokeFlow.addStep([AnalysisEvent, CritiqueEvent], reportJoke);

// Usage
async function main() {
  const result = await jokeFlow.run("pirates");
  console.log(result.data.result);
}

main().catch(console.error);
