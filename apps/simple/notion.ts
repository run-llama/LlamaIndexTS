import { Client } from "@notionhq/client";
import { program } from "commander";
import { NotionReader } from "llamaindex";

program
  .argument("<page>", "Notion page id (must be provided)")
  .action(async (page) => {
    // Initializing a client
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    const reader = new NotionReader({ client: notion });
    const documents = await reader.loadData(page);
    console.log(documents);
  });

program.parse();
