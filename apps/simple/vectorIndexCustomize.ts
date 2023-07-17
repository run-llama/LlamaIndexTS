import { Document } from "@llamaindex/core/src/Node";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import essay from "./essay";
import { RetrieverQueryEngine } from "@llamaindex/core/src/QueryEngine";

async function main() {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);
  const retriever = index.asRetriever();
  retriever.similarityTopK = 3;
  const queryEngine =  new RetrieverQueryEngine(retriever);
  const response = await queryEngine.aquery('Who is the author of the essay?');
  console.log(response.response);

}

main().catch(console.error);