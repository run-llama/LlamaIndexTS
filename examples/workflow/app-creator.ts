import {
  ContextInStep,
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/core/workflow";
import { OpenAI } from "llamaindex";

const MAX_REVIEWS = 3;

// Using the o1-preview model (see https://platform.openai.com/docs/guides/reasoning?reasoning-prompt-examples=coding-planning)
const llm = new OpenAI({ model: "o1-preview", temperature: 1 });

// example specification from https://platform.openai.com/docs/guides/reasoning?reasoning-prompt-examples=coding-planning
const specification = `Python app that takes user questions and looks them up in a 
database where they are mapped to answers. If there is a close match, it retrieves 
the matched answer. If there isn't, it asks the user to provide an answer and 
stores the question/answer pair in the database.`;

// Create custom event types
export class MessageEvent extends WorkflowEvent<{ msg: string }> {}
export class CodeEvent extends WorkflowEvent<{ code: string }> {}
export class ReviewEvent extends WorkflowEvent<{
  review: string;
  code: string;
}> {}

// Helper function to truncate long strings
const truncate = (str: string) => {
  const MAX_LENGTH = 60;
  if (str.length <= MAX_LENGTH) return str;
  return str.slice(0, MAX_LENGTH) + "...";
};

// the architect is responsible for writing the structure and the initial code based on the specification
const architect = async (context: ContextInStep, ev: StartEvent) => {
  // get the specification from the start event and save it to context
  context.set("specification", ev.data.input);
  const spec = context.get("specification");
  // write a message to send an update to the user
  console.log(`Writing app using this specification: ${truncate(spec)}`);
  const prompt = `Build an app for this specification: <spec>${spec}</spec>. Make a plan for the directory structure you'll need, then return each file in full. Don't supply any reasoning, just code.`;
  const code = await llm.complete({ prompt });
  return new CodeEvent({ code: code.text });
};

// the coder is responsible for updating the code based on the review
const coder = async (context: ContextInStep, ev: ReviewEvent) => {
  // get the specification from the context
  const spec = context.get("specification");
  // get the latest review and code
  const { review, code } = ev.data;
  // write a message to send an update to the user
  console.log(`Update code based on review: ${truncate(review)}`);
  const prompt = `We need to improve code that should implement this specification: <spec>${spec}</spec>. Here is the current code: <code>${code}</code>. And here is a review of the code: <review>${review}</review>. Improve the code based on the review, keep the specification in mind, and return the full updated code. Don't supply any reasoning, just code.`;
  const updatedCode = await llm.complete({ prompt });
  return new CodeEvent({ code: updatedCode.text });
};

// the reviewer is responsible for reviewing the code and providing feedback
const reviewer = async (context: ContextInStep, ev: CodeEvent) => {
  // get the specification from the context
  const spec = context.get("specification");
  // get latest code from the event
  const { code } = ev.data;
  // update and check the number of reviews
  const numberReviews = context.get("numberReviews", 0) + 1;
  context.set("numberReviews", numberReviews);
  if (numberReviews > MAX_REVIEWS) {
    // the we've done this too many times - return the code
    console.log(`Already reviewed ${numberReviews - 1} times, stopping!`);
    return new StopEvent({ result: code });
  }
  // write a message to send an update to the user
  console.log(`Review #${numberReviews}: ${truncate(code)}`);
  const prompt = `Review this code: <code>${code}</code>. Check if the code quality and whether it correctly implements this specification: <spec>${spec}</spec>. If you're satisfied, just return 'Looks great', nothing else. If not, return a review with a list of changes you'd like to see.`;
  const review = (await llm.complete({ prompt })).text;
  if (review.includes("Looks great")) {
    // the reviewer is satisfied with the code, let's return the review
    console.log(`Reviewer says: ${review}`);
    return new StopEvent({ result: code });
  }

  return new ReviewEvent({ review, code });
};

const codeAgent = new Workflow({ validate: true });
codeAgent.addStep(StartEvent, architect, { outputs: CodeEvent });
codeAgent.addStep(ReviewEvent, coder, { outputs: CodeEvent });
codeAgent.addStep(CodeEvent, reviewer, { outputs: ReviewEvent });

// Usage
async function main() {
  const result = await codeAgent.run(specification);
  console.log("Final code:\n", result.data.result);
}

main().catch(console.error);
