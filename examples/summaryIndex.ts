import {
  Document,
  Settings,
  SimpleNodeParser,
  SummaryIndex,
  SummaryRetrieverMode,
} from "llamaindex";

import essay from "./essay";

// Update node parser
Settings.nodeParser = new SimpleNodeParser({
  chunkSize: 40,
});

async function main() {
  const document = new Document({ text: essay, id_: "essay" });
  const index = await SummaryIndex.fromDocuments([document]);
  const queryEngine = index.asQueryEngine({
    retriever: index.asRetriever({ mode: SummaryRetrieverMode.LLM }),
  });
  const response = await queryEngine.query({
    query: "What did the author do growing up?",
  });
  console.log(response.toString());
}

main().catch((e: Error) => {
  console.error(e, e.stack);
});
