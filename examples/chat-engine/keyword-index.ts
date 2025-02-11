import { Document, KeywordTableIndex } from "llamaindex";
import essay from "../essay";

async function main() {
  const document = new Document({ text: essay });
  const index = await KeywordTableIndex.fromDocuments([document]);
  const chatEngine = index.asChatEngine();

  const response = await chatEngine.chat({
    message: "What is Harsh Mistress?",
  });
  console.log(response.message.content);
}

main().catch(console.error);
