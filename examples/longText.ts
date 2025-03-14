import {
  Document,
  SentenceSplitter,
  Settings,
  VectorStoreIndex,
} from "llamaindex";

export const STORAGE_DIR = "./data";

// Update node parser
Settings.nodeParser = new SentenceSplitter({
  chunkSize: 512,
  chunkOverlap: 20,
});
(async () => {
  // generate a document with a very long sentence (9000 words long)
  const longSentence = "is ".repeat(9000) + ".";
  const document = new Document({ text: longSentence, id_: "1" });
  await VectorStoreIndex.fromDocuments([document]);
})();
