import { Document, VectorStoreIndex } from "llamaindex";
import essay from "../essay";

async function main() {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);
  const chatEngine = index.asChatEngine({ similarityTopK: 5 });

  const response = await chatEngine.chat({
    message: "What did I work on in February 2021?",
  });
  console.log(response.message.content);
}

main().catch(console.error);
