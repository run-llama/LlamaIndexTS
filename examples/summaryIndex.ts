import {
  Document,
  SimpleNodeParser,
  SummaryIndex,
  SummaryRetrieverMode,
  serviceContextFromDefaults,
} from "llamaindex";
import essay from "./essay";

async function main() {
  const serviceContext = serviceContextFromDefaults({
    nodeParser: new SimpleNodeParser({
      chunkSize: 40,
    }),
  });
  const document = new Document({ text: essay, id_: "essay" });
  const index = await SummaryIndex.fromDocuments([document], {
    serviceContext,
  });
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
