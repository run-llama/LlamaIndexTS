import { program } from "commander";
import {
  AudioTranscriptReader,
  TranscribeParams,
  VectorStoreIndex,
} from "llamaindex";
import { stdin as input, stdout as output } from "node:process";
// readline/promises is still experimental so not in @types/node yet
// @ts-ignore
import readline from "node:readline/promises";

program
  .option("-a, --audio [string]", "URL or path of the audio file to transcribe")
  .option("-i, --transcript-id [string]", "ID of the AssemblyAI transcript")
  .action(async (options) => {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.log("No ASSEMBLYAI_API_KEY found in environment variables.");
      return;
    }

    const reader = new AudioTranscriptReader();
    let params: TranscribeParams | string;
    if (options.audio) {
      params = {
        audio: options.audio,
      };
    } else if (options.transcriptId) {
      params = options.transcriptId;
    } else {
      console.log("You must provide either an --audio or a --transcript-id");
      return;
    }

    const documents = await reader.loadData(params);
    console.log(documents);

    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments(documents);

    // Create query engine
    const queryEngine = index.asQueryEngine();

    const rl = readline.createInterface({ input, output });
    while (true) {
      const query = await rl.question("Ask a question: ");

      if (!query) {
        break;
      }

      const response = await queryEngine.query({ query });

      console.log(response.toString());
    }
  });

program.parse();
