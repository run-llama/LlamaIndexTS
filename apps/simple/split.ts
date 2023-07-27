import fs from "fs/promises";
import { SentenceSplitter } from "llamaindex";

async function main() {
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8"
  );

  const textSplitter = new SentenceSplitter();

  const chunks = textSplitter.splitTextWithOverlaps(essay);

  console.log(chunks);
}

main();
