import {
  PineconeVectorStore,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const pcvs = new PineconeVectorStore();

    const ctx = serviceContextFromDefaults();
    const index = await VectorStoreIndex.fromVectorStore(pcvs, ctx);

    // Query the index
    const queryEngine = await index.asQueryEngine();

    let question = "";
    while (!isQuit(question)) {
      question = await getUserInput(readline);

      if (isQuit(question)) {
        readline.close();
        process.exit(0);
      }

      try {
        const answer = await queryEngine.query(question);
        console.log(answer.response);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  } catch (err) {
    console.error(err);
    console.log(
      "If your PineconeVectorStore connection failed, make sure to set env vars for PINECONE_API_KEY and PINECONE_ENVIRONMENT.",
    );
    process.exit(1);
  }
}

function isQuit(question: string) {
  return ["q", "quit", "exit"].includes(question.trim().toLowerCase());
}

// Function to get user input as a promise
function getUserInput(readline: any): Promise<string> {
  return new Promise((resolve) => {
    readline.question(
      "What would you like to know?\n>",
      (userInput: string) => {
        resolve(userInput);
      },
    );
  });
}

main()
  .catch(console.error)
  .finally(() => {
    process.exit(1);
  });
