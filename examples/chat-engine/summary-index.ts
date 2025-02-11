import { Document, SummaryIndex, SummaryRetrieverMode } from "llamaindex";
import essay from "../essay";

async function main() {
  const document = new Document({ text: essay });
  const index = await SummaryIndex.fromDocuments([document]);
  const chatEngine = index.asChatEngine({
    mode: SummaryRetrieverMode.LLM,
  });

  const response = await chatEngine.chat({
    message: "Summary about the author",
  });
  console.log(response.message.content);
}

main().catch(console.error);
