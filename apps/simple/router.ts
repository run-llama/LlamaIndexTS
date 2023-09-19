//Test the Selector here.
import { LLM, OpenAI } from "../../packages/core/src/llm/LLM";
import {
  defaultMultiSelectPrompt,
  defaultSingleSelectPrompt,
  MultiSelectPrompt,
  SingleSelectPrompt,
} from "../../packages/core/src/Prompt";
import {PDFReader} from '../../packages/core/src/readers/PDFReader';
import { LLMSelector } from "../../packages/core/src/Selector";
import { Document, TextNode } from "../../packages/core/src/Node";
import { QueryEngineTool, ToolMetadata } from "../../packages/core/src/Tool";
import { TreeSummarize } from "../../packages/core/src/ResponseSynthesizer";
import { RouterQueryEngine } from "../../packages/core/src/QueryEngine";
import { SimpleNodeParser } from "../../packages/core/src/NodeParser";
import { SimpleDocumentStore } from "../../packages/core/src/storage/docStore/SimpleDocumentStore";
import { SimpleVectorStore } from "../../packages/core/src/storage/vectorStore/SimpleVectorStore";
import { BaseDocumentStore } from "../../packages/core/src/storage/docStore/types";
import { VectorStore } from "../../packages/core/src/storage/vectorStore/types";
import { VectorStoreIndex } from "../../packages/core/src/indices/vectorStore/VectorStoreIndex";
import { serviceContextFromDefaults } from "../../packages/core/src/ServiceContext";
import { storageContextFromDefaults } from "../../packages/core/src/storage/StorageContext";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

async function main() {
  //Read data
  const reader: PDFReader = new PDFReader();
  const docs: Document[] = await reader.loadData('./data/brk-2022.pdf');
  const nodeparser = SimpleNodeParser.fromDefaults();

  //Sanity check, how many nodes do we need for this doc?
  const doc_nodes: Document[] = nodeparser.getNodesFromDocuments(docs);
  console.log(`We have ${doc_nodes.length} text nodes.\n`);


  //Make queryEngines here (mongoDB is fine)
  const serviceContext = serviceContextFromDefaults();
  const docStore: BaseDocumentStore = new SimpleDocumentStore();
  const vectorStore: VectorStore = new SimpleVectorStore();

  const qe1 = (await VectorStoreIndex.fromDocuments(doc_nodes.slice(0, 31))).asQueryEngine();
  const qe2 = (await VectorStoreIndex.fromDocuments(doc_nodes.slice(31,62))).asQueryEngine();
  const qe3 = (await VectorStoreIndex.fromDocuments(doc_nodes.slice(62,93))).asQueryEngine();
  const qe4 = (await VectorStoreIndex.fromDocuments(doc_nodes.slice(93,))).asQueryEngine();
  const qe_tools: QueryEngineTool[] = [{
    queryEngine: qe1,
    metadata: {name: "Berkshire Hathaway Annual Report, First Quarter", description: "Berkshire's Performance vs. the S&P 500, Chairman's Letter, Business Description" + 
                                                                                  "Description of Properties, Management's Discussion, " +
                                                                                  "Management's Report on Internal Controls"}
  },
  {
  queryEngine: qe2,
  metadata: {name: "Berkshire Hathaway Annual Report, Second Quarter", description: "Business Description, Description of Properties, Management's Discussion"}
},
  {
    queryEngine: qe3,
    metadata: {name: "Berkshire Hathaway Annual Report, Second Half", description: "Management's Report on Internal Controls, Internal Auditor's Report, " + 
                                                                                  "Consolidated Financial Statements, Shareholder Event and Meeting Information"}
  },
  {
    queryEngine: qe4,
    metadata: {name: "Berkshire Hathaway Annual Report, Second Half", description: "Property/Casualty Insurance, Operating Companies, Stock Transfer Agent"}
  }];

  //Set up RouterQueryEngine
  const llm: LLM = new OpenAI();
  const prompt: SingleSelectPrompt = defaultSingleSelectPrompt;
  const prompt2: MultiSelectPrompt = defaultMultiSelectPrompt;

  const num_selections: number = 2;

  //Single and Multi-select options
  const selector = new LLMSelector(llm, prompt2, num_selections);

  const RQE = new RouterQueryEngine(qe_tools, selector);
  const rl = readline.createInterface({ input, output });
  while (true) {
    const query = await rl.question("Query: ");

    if (!query) {
      break;
    }

    const response = await RQE.query(query);

    // Output response
    console.log(`Answer: ${response.toString()}`);
  }
}

main();
