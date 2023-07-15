import { Document, ListIndex, ListRetrieverMode } from "llamaindex";
import essay from "./essay";

async function main() {
  const document = new Document({ text: essay });
  const index = await ListIndex.fromDocuments([document]);
  const queryEngine = index.asQueryEngine(ListRetrieverMode.LLM);
  const response = await queryEngine.aquery(
    "What did the author do growing up?"
  );
  console.log(response.toString());
}

main().catch((e: Error) => {
  console.error(e, e.stack);
});
