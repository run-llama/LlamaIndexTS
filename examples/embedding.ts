import {
  OpenAIEmbedding,
  SentenceSplitter,
  SimpleDirectoryReader,
} from "llamaindex";

(async () => {
  const reader = new SimpleDirectoryReader();

  const splitter = new SentenceSplitter({
    chunkSize: 20,
    chunkOverlap: 20,
  });

  const documents = await reader.loadData({
    directoryPath: "../packages/core/examples",
  });

  const textSplits = splitter.splitText(documents[0].text);

  const openAIEmbedding = new OpenAIEmbedding();

  const embeddings = await openAIEmbedding.getTextEmbeddingsBatch(textSplits);

  process.stdout.write(JSON.stringify(embeddings));
})();
