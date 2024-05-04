import { LlamaParseReader, VectorStoreIndex } from "llamaindex";

async function main() {
  // Load PDF using LlamaParse. set apiKey here or in environment variable LLAMA_CLOUD_API_KEY
  const reader = new LlamaParseReader({
    resultType: "markdown",
    language: "en",
    numWorkers: 2, //Load files in batches of 2
    parsingInstruction:
      "The provided documents are datasheets and Quick-Installation-Guides for Solplanet's Ai-LB and Ai-HB series of batteries. They contain tables and graphics. There is also a lot of technical information. The goal is to extract and structure the knowledge in a coherent way",
  });
  // load an array of files
  const documents = await reader.loadData([
    "../data/LlamaParseData/Battery_Ai-HB-2.56LG_Datasheet.pdf",
    "../data/LlamaParseData/Battery_Ai-HB-075_100_125_150_200A-G2-Datasheet.pdf",
    "../data/LlamaParseData/Battery_Ai-LB-5_10kwh-Datasheet.pdf",
    "../data/LlamaParseData/Battery_Ai-LB-5k_Quick-Installation-Guide.pdf",
    "../data/LlamaParseData/Battery_Ai-LB-5K-Pro_Quick-Installation-Guide.pdf",
    "../data/LlamaParseData/Battery_Ai-LB-10k_Quick-Installation-Guide.pdf",
    "../data/LlamaParseData/Battery_Ai-LB-10K-Pro_Quick-Installation-Guide.pdf",
    "../data/LlamaParseData/Battery_Ai-LB-Pro-5_10kwh-Datasheet.pdf",
  ]);

  // Flatten the array of arrays of files
  const flatdocuments = documents.flat();

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(flatdocuments);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "Which Batteries can be used in parallel connection?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
