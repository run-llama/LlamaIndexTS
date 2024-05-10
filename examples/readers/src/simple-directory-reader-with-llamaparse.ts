import {
  LlamaParseReader,
  SimpleDirectoryReader,
  VectorStoreIndex,
} from "llamaindex";

async function main() {
  const reader = new SimpleDirectoryReader();

  const docs = await reader.loadData({
    directoryPath: "../data/parallel", // brk-2022.pdf split into 6 parts
    numWorkers: 2,
    // set LlamaParse as the default reader. Set apiKey here or in environment variable LLAMA_CLOUD_API_KEY
    defaultReader: new LlamaParseReader({
      language: "en",
      resultType: "markdown",
      parsingInstruction:
        "The provided files is Berkshire Hathaway's 2022 Annual Report. They contain figures, tables and raw data. Capture the data in a structured format. Mathematical equation should be put out as LATEX markdown (between $$).",
    }),
  });

  const index = await VectorStoreIndex.fromDocuments(docs);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query:
      "What is the general strategy for shareholder safety outlined in the report? Use an example with numbers",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
