"use server";
// test runtime
import { AutoTokenizer } from "@xenova/transformers";
import "llamaindex";
import "llamaindex/readers/SimpleDirectoryReader";

// @ts-expect-error
if (typeof EdgeRuntime !== "string") {
  throw new Error("Expected run in EdgeRuntime");
}

//#region make sure @xenova/transformers is working in edge runtime
const tokenizer = await AutoTokenizer.from_pretrained(
  "Xenova/clip-vit-base-patch32",
);

console.log("encode result:", tokenizer.encode("Hello, world!"));
//#endregion
