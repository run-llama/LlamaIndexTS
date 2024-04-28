import fs from "fs/promises";
import { LlamaParseReader } from "llamaindex";

async function main() {
  // Load PDF using LlamaParse. set apiKey here or in environment variable LLAMA_CLOUD_API_KEY
  const reader = new LlamaParseReader({
    resultType: "markdown",
    language: "en",
    parsingInstruction:
      "The provided document is a manga comic book. Most pages do NOT have title. It does not contain tables. Try to reconstruct the dialogue happening in a cohesive way. Output any math equation in LATEX markdown (between $$)",
  });
  const documents = await reader.loadData("../data/manga.pdf"); // The manga.pdf in the data folder is just a copy of the TOS, due to copyright laws. You have to place your own. I used "The Manga Guide to Calculus" by Hiroyuki Kojima

  // Assuming documents contain an array of pages or sections
  const parsedManga = documents.map((page) => page.text).join("\n---\n");

  // Output the parsed manga to .md file. Will be placed in ../example/readers/
  try {
    await fs.writeFile("./parsedManga.md", parsedManga);
    console.log("Output successfully written to parsedManga.md");
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}

main().catch(console.error);
