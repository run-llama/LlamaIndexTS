import fs from "node:fs/promises";

import {
  Document,
  OpenAI,
  OpenAIAgent,
  QueryEngineTool,
  SimpleNodeParser,
  SummaryIndex,
  VectorStoreIndex,
  serviceContextFromDefaults,
  storageContextFromDefaults,
} from "./index";

import { extractWikipedia } from "./extractWikipedia";
import { ObjectIndex, SimpleToolNodeMapping } from "./objects/base";

const wikiTitles = ["Brazil", "Canada"];

async function main() {
  await extractWikipedia(wikiTitles);

  const countryDocs: any = {};

  for (const title of wikiTitles) {
    const path = `./data/${title}.txt`;

    const text = await fs.readFile(path, "utf-8");

    const documents = new Document({ text: text, id_: path });

    countryDocs[title] = [documents];
  }

  const llm = new OpenAI({
    model: "gpt-4",
  });

  const ctx = serviceContextFromDefaults({ llm });
  const storageContext = await storageContextFromDefaults({
    persistDir: "./persisted",
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
      // storageContext,
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

  const allTools: any[] = [];

  console.log(`Creating tools for all countries`);

  for (const title of wikiTitles) {
    const wikiSummary = `This content contains Wikipedia articles about ${title}. 
            Use this tool if you want to answer any questions about ${title}
        `;

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

  // @ts-ignore
  // console.log({ toolMapping })

  console.log("creating vector store index");

  const index = await VectorStoreIndex.init({
    storageContext,
  });

  console.log("creating object index");

  // console.log({ allTools })

  const obj_index = await new ObjectIndex(index, toolMapping).fromObjects(
    allTools,
    toolMapping,
    VectorStoreIndex,
    {},
  );

  // @ts-ignore
  console.log({ obj_index: obj_index });

  console.log("creating top agent");

  const toolRetriever = await obj_index.asRetriever({});

  const testRetriever = await toolRetriever.retrieve("brazil");

  console.log({
    testRetriever: testRetriever[0].node,
    testRetriever2: testRetriever[1].node,
  });

  const top_agent = new OpenAIAgent({
    toolRetriever: toolRetriever,
    llm,
    verbose: true,
  });

  console.log("chatting with top agent");

  const response = await top_agent.chat({
    message: "Summarize Canada.",
  });

  console.log({
    capitalOfBrazil: response,
  });

  // const response2 = await top_agent.chat({
  //     message: "What is the capital of the United States?",
  // })

  // console.log({
  //     capitalOfUS: response2
  // })
}

main();
