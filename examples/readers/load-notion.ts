import { Client } from "@notionhq/client";
import { program } from "commander";
import { NotionReader, VectorStoreIndex } from "llamaindex";
import { stdin as input, stdout as output } from "node:process";
// readline/promises is still experimental so not in @types/node yet
// @ts-ignore
import readline from "node:readline/promises";

program
  .argument("[page]", "Notion page id (must be provided)")
  .action(async (page, _options, command) => {
    // Initializing a client

    if (!process.env.NOTION_TOKEN) {
      console.log(
        "No NOTION_TOKEN found in environment variables. You will need to register an integration https://www.notion.com/my-integrations and put it in your NOTION_TOKEN environment variable.",
      );
      return;
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    if (!page) {
      const response = await notion.search({
        filter: {
          value: "page",
          property: "object",
        },
        sort: {
          direction: "descending",
          timestamp: "last_edited_time",
        },
      });

      const { results } = response;

      if (results.length === 0) {
        console.log(
          "No pages found. You will need to share it with your integration. (tap the three dots on the top right, find Add connections, and add your integration)",
        );
        return;
      } else {
        const pages = results
          .map((result) => {
            if (!("url" in result)) {
              return null;
            }

            return {
              id: result.id,
              url: result.url,
            };
          })
          .filter((page) => page !== null);
        console.log("Found pages:");
        console.table(pages);
        console.log(`To run, run ts-node ${command.name()} [page id]`);
        return;
      }
    }

    const reader = new NotionReader({ client: notion });
    const documents = await reader.loadData(page);
    console.log(documents);

    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments(documents);

    // Create query engine
    const queryEngine = index.asQueryEngine();

    const rl = readline.createInterface({ input, output });
    while (true) {
      const query = await rl.question("Query: ");

      if (!query) {
        break;
      }

      const response = await queryEngine.query({ query });

      // Output response
      console.log(response.toString());
    }
  });

program.parse();
