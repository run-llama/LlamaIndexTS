import { Document } from "@llamaindex/core/src/Node";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import essay from "./essay";
import { RetrieverQueryEngine } from "@llamaindex/core/src/QueryEngine";

// Customize retrieval and query args 
async function main() {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);
  const retriever = index.asRetriever();
  // TODO: using similarityTopK > 2 causes an error
  retriever.similarityTopK = 3;
  // TODO: cannot pass responseSynthesizer into retriever query engine
  const queryEngine =  new RetrieverQueryEngine(retriever);
  const response = await queryEngine.aquery('Who is the author of the essay?');
  console.log(response.response);

}

main().catch(console.error);