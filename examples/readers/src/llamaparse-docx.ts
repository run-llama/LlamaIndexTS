import { Language, LlamaParseReader } from "@llamaindex/cloud";
import fs from "node:fs";
import path from "node:path";

type LlamaParseReaderParams = Partial<
  Omit<LlamaParseReader, "language" | "apiKey">
> & {
  language?: Language | Language[] | undefined;
  apiKey?: string | undefined;
};

async function main() {
  const filePath = "../data/pto_policy_employee.docx";
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist`);
    process.exit(1);
  } else {
    console.log(`File ${filePath} exists`);
  }

  const params: LlamaParseReaderParams = {
    verbose: true,
    parsingInstruction:
      "Extract the text from the document a long with any images and tables.  This is a document for a course and the contents of the images are important.",
    fastMode: false,
    gpt4oMode: true,
    useVendorMultimodalModel: true,
    vendorMultimodalModelName: "anthropic-sonnet-3.5",
    premiumMode: true,
    resultType: "markdown",
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
    doNotCache: true,
  };

  // set up the llamaparse reader
  const reader = new LlamaParseReader(params);

  const buffer = fs.readFileSync(filePath);
  const documents = await reader.loadDataAsContent(
    new Uint8Array(buffer),
    path.basename(filePath),
  );

  let allText = "";
  documents.forEach((doc) => {
    allText += doc.text;
  });

  console.log(allText);
}

main().catch(console.error);
