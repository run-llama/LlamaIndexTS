import fs from "node:fs/promises";

import {
  Document,
  ObjectIndex,
  OpenAI,
  OpenAIAgent,
  QueryEngineTool,
  SimpleNodeParser,
  SimpleToolNodeMapping,
  SummaryIndex,
  VectorStoreIndex,
  serviceContextFromDefaults,
  storageContextFromDefaults,
} from "llamaindex";

import { extractWikipedia } from "./helpers/extractWikipedia";

const wikiTitles = ["Brazil", "Canada"];

async function main() {
  await extractWikipedia(wikiTitles);

  const countryDocs: any = {};

  for (const title of wikiTitles) {
    const path = `./agent/helpers/tmp_data/${title}.txt`;

    const text = await fs.readFile(path, "utf-8");

    const documents = new Document({ text: text, id_: path });

    countryDocs[title] = [documents];
  }

  const llm = new OpenAI({
    model: "gpt-4",
  });

  const ctx = serviceContextFromDefaults({ llm });

  const storageContext = await storageContextFromDefaults({
    persistDir: "./storage",
  });

  const allNodes: any = [];

  const agents: any = {};
  const queryEngines: any = {};

  for (const title of wikiTitles) {
    console.log(`Processing ${title}`);

    const nodes = new SimpleNodeParser({
      chunkSize: 200,
      chunkOverlap: 20,
    }).getNodesFromDocuments(countryDocs[title]);

    allNodes.push(...nodes);

    console.log(`Creating index for ${title}`);

    const vectorIndex = await VectorStoreIndex.init({
      nodes,
      serviceContext: ctx,
      storageContext: storageContext,
    });

    const summaryIndex = await SummaryIndex.init({
      serviceContext: ctx,
      nodes,
    });

    console.log(`Creating query engines for ${title}`);

    const vectorQueryEngine = summaryIndex.asQueryEngine();
    const summaryQueryEngine = summaryIndex.asQueryEngine();

    const queryEngineTools = [
      new QueryEngineTool({
        queryEngine: vectorQueryEngine,
        metadata: {
          name: "vector_tool",
          description: `Useful for questions related to specific aspects of ${title} (e.g. the history, arts and culture, sports, demographics, or more).`,
        },
      }),
      new QueryEngineTool({
        queryEngine: summaryQueryEngine,
        metadata: {
          name: "summary_tool",
          description: `Useful for any requests that require a holistic summary of EVERYTHING about ${title}. For questions about more specific sections, please use the vector_tool.`,
        },
      }),
    ];

    console.log(`Creating agents for ${title}`);

    const agent = new OpenAIAgent({
      tools: queryEngineTools,
      llm,
      verbose: true,
    });

    agents[title] = agent;
    queryEngines[title] = vectorIndex.asQueryEngine();
  }

  const allTools: QueryEngineTool[] = [];

  console.log(`Creating tools for all countries`);

  for (const title of wikiTitles) {
    const wikiSummary = `This content contains Wikipedia articles about ${title}. Use this tool if you want to answer any questions about ${title}`;

    console.log(`Creating tool for ${title}`);

    const docTool = new QueryEngineTool({
      queryEngine: agents[title],
      metadata: {
        name: `tool_${title}`,
        description: wikiSummary,
      },
    });

    allTools.push(docTool);
  }

  console.log("creating tool mapping");

  const toolMapping = SimpleToolNodeMapping.fromObjects(allTools);

  console.log("creating vector store index");

  const index = await VectorStoreIndex.init({
    storageContext,
  });

  console.log("creating object index");

  const obj_index = await new ObjectIndex(index, toolMapping).fromObjects(
    allTools,
    toolMapping,
    VectorStoreIndex,
    {},
  );

  console.log("creating top agent");

  const toolRetriever = await obj_index.asRetriever({});

  const top_agent = new OpenAIAgent({
    toolRetriever: toolRetriever,
    llm,
    verbose: true,
    prefixMessages: [
      {
        content:
          "You are an agent designed to answer queries about a set of given countries. Please always use the tools provided to answer a question. Do not rely on prior knowledge.",
        role: "system",
      },
    ],
  });

  const response = await top_agent.chat({
    message: "The official language of Canadá?",
  });

  console.log({
    capitalOfBrazil: response,
  });
}

main();
