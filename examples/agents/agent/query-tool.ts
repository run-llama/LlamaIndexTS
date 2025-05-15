import { openai } from "@llamaindex/openai";
import {
  agent,
  agentStreamEvent,
  agentToolCallResultEvent,
} from "@llamaindex/workflow";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  const index = await VectorStoreIndex.fromDocuments([
    new Document({
      text: "Cats have a specialized collarbone that allows them to always land on their feet when they fall.",
    }),
    new Document({
      text: "Dogs have a sense of smell that is 10,000 to 100,000 times more acute than humans.",
    }),
    new Document({
      text: "Cats are known for their agility and ability to jump high.",
    }),
  ]);

  const myAgent = agent({
    llm: openai({ model: "gpt-4o" }),
    tools: [
      index.queryTool({
        options: { similarityTopK: 2 },
        includeSourceNodes: true,
      }),
    ],
  });

  const events = myAgent.runStream("The fact about cats");

  for await (const event of events) {
    if (agentToolCallResultEvent.include(event)) {
      console.log(
        "Using these retrieved information to answer the question:\n",
        event.data.toolOutput.result,
      );
    } else if (agentStreamEvent.include(event)) {
      for (const chunk of event.data.delta) {
        process.stdout.write(chunk);
      }
    }
  }
}

void main().then(() => {
  console.log("Done");
});
