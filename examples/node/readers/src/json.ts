import { JSONReader } from "llamaindex";

async function main() {
  // Data
  const file = "../data/tinytweets.json";
  const nonAsciiContent = '{"message": "こんにちは世界"}';
  const jsonlContent = '{"tweet": "Hello world"}\n{"tweet": "こんにちは世界"}';

  // Convert strings to Uint8Array for loadDataAsContent
  const nonAsciiBuffer = new TextEncoder().encode(nonAsciiContent);
  const jsonlBuffer = new TextEncoder().encode(jsonlContent);

  // Default settings
  const reader1 = new JSONReader();
  const docs1 = await reader1.loadData(file);
  console.log(docs1[0]);

  // Unclean JSON
  const reader2 = new JSONReader({ cleanJson: false });
  const docs2 = await reader2.loadData(file);
  console.log(docs2[0]);

  // Depth first yield of JSON structural paths, going back 2 levels
  const reader3 = new JSONReader({ levelsBack: 2 });
  const docs3 = await reader3.loadData(file);
  console.log(docs3[0]);

  // Depth first yield of all levels
  const reader4 = new JSONReader({ levelsBack: 0 });
  const docs4 = await reader4.loadData(file);
  console.log(docs4[0]);

  // Depth first yield of all levels, collapse structural paths below length 100
  const reader5 = new JSONReader({ levelsBack: 0, collapseLength: 100 });
  const docs5 = await reader5.loadData(file);
  console.log(docs5[0]);

  // Convert ASCII to unichode escape sequences
  const reader6 = new JSONReader({ ensureAscii: true });
  const docs6 = await reader6.loadDataAsContent(nonAsciiBuffer);
  console.log(docs6[0]);

  // JSON Lines Format
  const reader7 = new JSONReader({ isJsonLines: true });
  const docs7 = await reader7.loadDataAsContent(jsonlBuffer);
  console.log(docs7[0]);
}

main().catch(console.error);
