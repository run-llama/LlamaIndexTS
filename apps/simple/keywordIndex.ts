import {
  Document,
  KeywordTableIndex,
  KeywordTableRetrieverMode,
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
  const document = new Document({ text: essay, id_: "essay" });
  const index = await KeywordTableIndex.fromDocuments([document], {
    serviceContext,
  });

  // llm retriever
  const llmQueryEngine = index.asQueryEngine({
    retriever: index.asRetriever({
      mode: KeywordTableRetrieverMode.LLM,
    }),
  });
  const llmResponse = await llmQueryEngine.query(
    "What did the author do growing up?",
  );
  console.log(llmResponse.toString());

  // simple retriever
  const simpleQueryEngine = index.asQueryEngine({
    retriever: index.asRetriever({
      mode: KeywordTableRetrieverMode.SIMPLE,
    }),
  });
  const simpleResponse = await simpleQueryEngine.query(
    "What did the author do growing up?",
  );
  console.log(simpleResponse.toString());

  // rake retriever
  const rakeQueryEngine = index.asQueryEngine({
    retriever: index.asRetriever({
      mode: KeywordTableRetrieverMode.RAKE,
    }),
  });
  const rakeResponse = await rakeQueryEngine.query(
    "What did the author do growing up?",
  );
  console.log(rakeResponse.toString());
}

main().catch((e: Error) => {
  console.error(e, e.stack);
});
