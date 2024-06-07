import * as fs from "fs";
import { LlamaParseReader } from "llamaindex";

async function main() {
  // Load PDF using LlamaParse
  const reader = new LlamaParseReader({ resultType: "json" });
  const jsonObjs = await reader.loadJson("../data/uber_10q_march_2022.pdf");

  // Write the JSON objects to a file
  fs.writeFileSync("jsonObjs.json", JSON.stringify(jsonObjs, null, 4));
  console.log("Array of JSON objects has been written to jsonObjs.json");

  const jsonList = jsonObjs[0]["pages"];

  // Write the list of JSON objects as a single array to a file
  fs.writeFileSync("jsonList.json", JSON.stringify(jsonList, null, 4));
  console.log(
    "List of JSON objects as single array has been written to jsonList.json",
  );
}

main().catch(console.error);
