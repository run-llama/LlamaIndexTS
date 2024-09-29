"use server";
import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
} from "@llamaindex/core/workflow";
import { createStreamableUI } from "ai/rsc";
import { OpenAI, SimpleKVStore } from "llamaindex";
import { Loader2 } from "lucide-react";

const kvStore = new SimpleKVStore();

type Context = {
  kVStore: SimpleKVStore;
  ui: ReturnType<typeof createStreamableUI>;
};

const MAX_REVIEWS = 3;

// Using the o1-preview model (see https://platform.openai.com/docs/guides/reasoning?reasoning-prompt-examples=coding-planning)
const llm = new OpenAI({ model: "o1-preview", temperature: 1 });

class CodeEvent extends WorkflowEvent<{ code: string }> {}

class ReviewEvent extends WorkflowEvent<{
  review: string;
  code: string;
}> {}

const architect = async ({ kVStore, ui }: Context, ev: StartEvent) => {
  await kVStore.put("specification", ev.data.input);
  const spec = await kVStore.get("specification");
  ui.update(
    <div className="flex items-center text-sm text-gray-700">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span>Generating initial code from the specification...</span>
    </div>,
  );
  const prompt = `Build an app for this specification: <spec>${spec}</spec>. Make a plan for the directory structure you'll need, then return each file in full. Don't supply any reasoning, just code.`;
  const code = await llm.complete({ prompt });
  return new CodeEvent({ code: code.text });
};

const coder = async ({ kVStore, ui }: Context, ev: ReviewEvent) => {
  const spec = await kVStore.get("specification");
  const { review, code } = ev.data;
  ui.update(
    <div className="flex items-center text-sm text-gray-700">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span>Updating code based on the provided review...</span>
    </div>,
  );
  const prompt = `We need to improve code that should implement this specification: <spec>${spec}</spec>. Here is the current code: <code>${code}</code>. And here is a review of the code: <review>${review}</review>. Improve the code based on the review, keep the specification in mind, and return the full updated code. Don't supply any reasoning, just code.`;
  const updatedCode = await llm.complete({ prompt });
  return new CodeEvent({ code: updatedCode.text });
};

const reviewer = async ({ kVStore, ui }: Context, ev: CodeEvent) => {
  const spec = await kVStore.get("specification");
  const { code } = ev.data;
  const numberReviews = ((await kVStore.get("numberReviews")) ?? 0) + 1;
  await kVStore.put("numberReviews", numberReviews);
  if (numberReviews > MAX_REVIEWS) {
    ui.update(
      <div className="flex items-center text-sm text-red-600">
        <span>Review limit exceeded. Stopping further reviews.</span>
      </div>,
    );
    return new StopEvent({ result: code });
  }
  ui.update(
    <div className="flex items-center text-sm text-gray-700">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span>Reviewing the code for compliance and quality...</span>
    </div>,
  );
  const prompt = `Review this code: <code>${code}</code>. Check if the code quality and whether it correctly implements this specification: <spec>${spec}</spec>. If you're satisfied, just return 'Looks great', nothing else. If not, return a review with a list of changes you'd like to see.`;
  const review = (await llm.complete({ prompt })).text;
  if (review.includes("Looks great")) {
    ui.update(
      <div className="flex items-center text-sm text-green-600">
        <span>Final review completed: {review}</span>
      </div>,
    );
    return new StopEvent({ result: code });
  }

  return new ReviewEvent({ review, code });
};

const codeAgent = new Workflow<string, string, Context>().with({
  kVStore: kvStore,
  ui: null! as ReturnType<typeof createStreamableUI>,
});
codeAgent.addStep(StartEvent, architect, { outputs: CodeEvent });
codeAgent.addStep(ReviewEvent, coder, { outputs: CodeEvent });
codeAgent.addStep(CodeEvent, reviewer, { outputs: [ReviewEvent, StopEvent] });

export async function run(specification: string) {
  "use server";
  const ui = createStreamableUI();
  const result = codeAgent.run(specification).with({
    kVStore: kvStore,
    ui,
  });
  return {
    result: result.then(({ data }) => {
      ui.done();
      return data.result;
    }),
    ui: ui.value,
  };
}
