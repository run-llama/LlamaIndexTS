import {
  Document,
  SentenceSplitter,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { OldSentenceSplitter } from "./old-sentence-splitter";
export const STORAGE_DIR = "./data";

// Update node parser
(async () => {
  // generate a document with a very long sentence (9000 words long)
  const longSentence = "is ".repeat(9000) + ".";
  const document = new Document({ text: longSentence, id_: "1" });

  Settings.nodeParser = new SentenceSplitter({
    chunkSize: 512,
    chunkOverlap: 20,
  });
  console.time("VectorStoreIndex.fromDocuments");
  await VectorStoreIndex.fromDocuments([document]);
  console.timeEnd("VectorStoreIndex.fromDocuments");

  Settings.nodeParser = new OldSentenceSplitter({
    chunkSize: 512,
    chunkOverlap: 20,
  });
  console.time("VectorStoreIndex.fromDocuments with old splitter");
  await VectorStoreIndex.fromDocuments([document]);
  console.timeEnd("VectorStoreIndex.fromDocuments with old splitter");
})();
