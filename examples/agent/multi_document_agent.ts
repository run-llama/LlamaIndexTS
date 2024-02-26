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

  const countryDocs: Record<string, Document> = {};

  for (const title of wikiTitles) {
    const path = `./agent/helpers/tmp_data/${title}.txt`;
    const text = await fs.readFile(path, "utf-8");
    const document = new Document({ text: text, id_: path });
    countryDocs[title] = document;
  }

  const llm = new OpenAI({
    model: "gpt-4",
  });

  const serviceContext = serviceContextFromDefaults({ llm });
  const storageContext = await storageContextFromDefaults({
    persistDir: "./storage",
  });

  // TODO: fix any
  const documentAgents: any = {};
  const queryEngines: any = {};

  for (const title of wikiTitles) {
    console.log(`Processing ${title}`);

    const nodes = new SimpleNodeParser({
      chunkSize: 200,
      chunkOverlap: 20,
    }).getNodesFromDocuments([countryDocs[title]]);

    console.log(`Creating index for ${title}`);

    const vectorIndex = await VectorStoreIndex.init({
      serviceContext: serviceContext,
      storageContext: storageContext,
      nodes,
    });

    const summaryIndex = await SummaryIndex.init({
      serviceContext: serviceContext,
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

    documentAgents[title] = agent;
    queryEngines[title] = vectorIndex.asQueryEngine();
  }

  const allTools: QueryEngineTool[] = [];

  console.log(`Creating tools for all countries`);

  for (const title of wikiTitles) {
    const wikiSummary = `This content contains Wikipedia articles about ${title}. Use this tool if you want to answer any questions about ${title}`;

    console.log(`Creating tool for ${title}`);

    const docTool = new QueryEngineTool({
      queryEngine: documentAgents[title],
      metadata: {
        name: `tool_${title}`,
        description: wikiSummary,
      },
    });

    allTools.push(docTool);
  }

  console.log("creating tool mapping");

  const toolMapping = SimpleToolNodeMapping.fromObjects(allTools);

  const objectIndex = await ObjectIndex.fromObjects(
    allTools,
    toolMapping,
    VectorStoreIndex,
    {
      serviceContext,
    },
  );

  const topAgent = new OpenAIAgent({
    toolRetriever: await objectIndex.asRetriever({}),
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

  const response = await topAgent.chat({
    message: "Tell me the differences between Brazil and Canada economics?",
  });

  console.log({
    capitalOfBrazil: response,
  });
}

main();
