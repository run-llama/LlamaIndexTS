import {
  PGVectorStore,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const pgvs = new PGVectorStore();
    // Optional - set your collection name, default is no filter on this field.
    // pgvs.setCollection();

    const ctx = serviceContextFromDefaults();
    const index = await VectorStoreIndex.fromVectorStore(pgvs, ctx);

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
        const answer = await queryEngine.query({ query: question });
        console.log(answer.response);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  } catch (err) {
    console.error(err);
    console.log(
      "If your PGVectorStore init failed, make sure to set env vars for PGUSER or USER, PGHOST, PGPORT and PGPASSWORD as needed.",
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
