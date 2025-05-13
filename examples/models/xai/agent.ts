import { wiki } from "@llamaindex/tools";
import { agent } from "@llamaindex/workflow";
import { xai } from "@llamaindex/xai";

(async function () {
  const wikiAgent = agent({
    tools: [wiki()],
    llm: xai({ model: "grok-3-latest" }),
  });

  const response = await wikiAgent.run(
    "What's the history of New York from Wikipedia in 3 sentences?",
  );
  console.log(response.data.result);
})();
