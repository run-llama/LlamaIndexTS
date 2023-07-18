import {
  Document,
  ListIndex,
  ListRetrieverMode,
  serviceContextFromDefaults,
  SimpleNodeParser,
} from "llamaindex";
import essay from "./essay";

async function main() {
  const serviceContext = serviceContextFromDefaults({
    nodeParser: new SimpleNodeParser({
      chunkSize: 40,
    }),
  });
  const document = new Document({ text: essay });
  const index = await ListIndex.fromDocuments({
    documents: [document],
    serviceContext,
  });
  const queryEngine = index.asQueryEngine(ListRetrieverMode.LLM);
  const response = await queryEngine.aquery(
    "What did the author do growing up?"
  );
  console.log(response.toString());
}

main().catch((e: Error) => {
  console.error(e, e.stack);
});
