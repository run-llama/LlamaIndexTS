import { Document } from "@llamaindex/core/src/Node";
import { ListIndex, ListRetrieverMode } from "@llamaindex/core/src/index/list";
import essay from "./essay";
import { serviceContextFromDefaults } from "@llamaindex/core/src/ServiceContext";
import { SimpleNodeParser } from "@llamaindex/core/src/NodeParser";

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
