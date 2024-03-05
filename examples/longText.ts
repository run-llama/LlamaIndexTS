import {
  Document,
  SimpleNodeParser,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

export const STORAGE_DIR = "./data";

(async () => {
  // create service context that is splitting sentences longer than CHUNK_SIZE
  const serviceContext = serviceContextFromDefaults({
    nodeParser: new SimpleNodeParser({
      chunkSize: 512,
      chunkOverlap: 20,
      splitLongSentences: true,
    }),
  });

  // generate a document with a very long sentence (9000 words long)
  const longSentence = "is ".repeat(9000) + ".";
  const document = new Document({ text: longSentence, id_: "1" });
  await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });
})();
