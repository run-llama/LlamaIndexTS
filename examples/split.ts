import fs from "node:fs/promises";

import { SentenceSplitter } from "llamaindex";

async function main() {
  const path = "node_modules/llamaindex/examples/abramov.txt";
  const essay = await fs.readFile(path, "utf-8");

  const textSplitter = new SentenceSplitter();

  const chunks = textSplitter.splitTextWithOverlaps(essay);

  console.log(chunks);
}

main();
