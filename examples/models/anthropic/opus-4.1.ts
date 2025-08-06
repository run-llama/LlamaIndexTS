import { anthropic } from "@llamaindex/anthropic";
import { agent } from "@llamaindex/workflow";

(async function () {
  const workflow = agent({
    llm: anthropic({
      model: "claude-4-1-opus",
    }),
  });
  const result = await workflow.run(
    "What are three compounds we should consider investigating to advance research into new antibiotics? Why should we consider them?",
  );
  console.log(result.data.result);
})();
