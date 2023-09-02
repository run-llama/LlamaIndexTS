import { Client } from "@notionhq/client";
import { program } from "commander";
import { NotionReader } from "llamaindex";

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
  });

program.parse();
