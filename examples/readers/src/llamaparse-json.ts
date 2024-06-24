import fs from "fs/promises";
import { LlamaParseReader } from "llamaindex";

async function main() {
  // Load PDF using LlamaParse json mode
  const reader = new LlamaParseReader({ resultType: "json" });
  const jsonObjs = await reader.loadJson("../data/uber_10q_march_2022.pdf");

  // Write the JSON objects to a file
  try {
    await fs.writeFile("jsonObjs.json", JSON.stringify(jsonObjs, null, 4));
    console.log("Array of JSON objects has been written to jsonObjs.json");
  } catch (e) {
    console.error("Error writing jsonObjs.json", e);
  }

  const jsonList = jsonObjs[0]["pages"];

  // Write the list of JSON objects as a single array to a file
  try {
    await fs.writeFile("jsonList.json", JSON.stringify(jsonList, null, 4));
    console.log(
      "List of JSON objects as single array has been written to jsonList.json",
    );
  } catch (e) {
    console.error("Error writing jsonList.json", e);
  }
}

main().catch(console.error);
