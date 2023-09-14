//Test the Selector here.
import { LLM, OpenAI } from "../packages/core/src/llm/LLM";
import {
  defaultMultiSelectPrompt,
  defaultSingleSelectPrompt,
  MultiSelectPrompt,
  SingleSelectPrompt,
} from "../packages/core/src/Prompt";
import { LLMSelector } from "../packages/core/src/Selector";
import { ToolMetadata } from "../packages/core/src/Tool";
import { TreeSummarize } from "../packages/core/src/ResponseSynthesizer";
import { RouterQueryEngine } from "../packages/core/src/QueryEngine";

async function main() {
  const mock_metadata: ToolMetadata[] = [
    {name: "Database A", description: "has recent tech news articles"},
    {name: "Database B", description: "has other recent tech news articles"}
  ];
  //Make queryEngines here (mongoDB is fine)


  //Set up RouterQueryEngine
  const query: string = "How is OpenAI doing so far?";
  const llm: LLM = new OpenAI();
  const prompt: SingleSelectPrompt = defaultSingleSelectPrompt;
  const prompt2: MultiSelectPrompt = defaultMultiSelectPrompt;

  const selector = new LLMSelector(llm, prompt2, 2);
  console.log(await selector.select(query, mock_metadata));
}

main();
