import { Client } from "@notionhq/client";
import {
  Crawler,
  DatabaseCrawler,
  Pages,
  crawler,
  dbCrawler,
  pageToString,
} from "notion-md-crawler";
import { Document } from "../Node";
import { BaseReader } from "./base";

type OptionalSerializers = Parameters<Crawler>[number]["serializers"];

/**
 * Options for initializing the NotionReader class
 * @typedef {Object} NotionReaderOptions
 * @property {Client} client - The Notion Client object for API interactions
 * @property {OptionalSerializers} [serializers] - Option to customize serialization. See [the url](https://github.com/TomPenguin/notion-md-crawler/tree/main) for details.
 */
type NotionReaderOptions = {
  client: Client;
  serializers?: OptionalSerializers;
};

/**
 * Notion pages are retrieved recursively and converted to Document objects.
 * Notion Database can also be loaded, and [the serialization method can be customized](https://github.com/TomPenguin/notion-md-crawler/tree/main).
 *
 * [Note] To use this reader, must be created the Notion integration must be created in advance
 * Please refer to [this document](https://www.notion.so/help/create-integrations-with-the-notion-api) for details.
 */
export class NotionReader implements BaseReader {
  private crawl: ReturnType<Crawler>;
  private dbCrawl: ReturnType<DatabaseCrawler>;

  /**
   * Constructor for the NotionReader class
   * @param {NotionReaderOptions} options - Configuration options for the reader
   */
  constructor({ client, serializers }: NotionReaderOptions) {
    this.crawl = crawler({ client, serializers });
    this.dbCrawl = dbCrawler({ client, serializers });
  }

  /**
   * Converts Pages to an array of Document objects
   * @param {Pages} pages - The Notion pages to convert (Return value of `loadPages`)
   * @returns {Document[]} An array of Document objects
   */
  toDocuments(pages: Pages): Document[] {
    return Object.values(pages).map((page) => {
      const text = pageToString(page);
      return new Document({ text, metadata: page.metadata });
    });
  }

  /**
   * Loads recursively the Notion page with the specified root page ID.
   * @param {string} rootPageId - The root Notion page ID
   * @returns {Promise<Pages>} A Promise that resolves to a Pages object(Convertible with the `toDocuments` method)
   */
  async loadPages(rootPageId: string): Promise<Pages> {
    return this.crawl(rootPageId);
  }

  /**
   * Loads recursively the Notion database with the specified database ID.
   * @param {string} databaseId - The Notion database ID from which to start the crawl
   * @returns {Promise<Pages>} A Promise that resolves to a Pages object(Convertible with the `toDocuments` method)
   */
  async loadDatabasePages(databaseId: string): Promise<Pages> {
    return this.dbCrawl(databaseId);
  }

  /**
   * Loads recursively Notion pages and converts them to an array of Document objects
   * @param {string} rootPageId - The root Notion page ID
   * @param {Object} [options] - Options for loading data
   * @param {"page" | "database"} [options.mode="page"] - The mode to use when loading data. "page" to load a page, "database" to load a database
   * @returns {Promise<Document[]>} A Promise that resolves to an array of Document objects
   */
  async loadData(
    rootPageId: string,
    { mode }: { mode: "page" | "database" } = { mode: "page" },
  ): Promise<Document[]> {
    let pages: Pages;
    if (mode === "page") {
      pages = await this.loadPages(rootPageId);
    } else {
      pages = await this.loadDatabasePages(rootPageId);
    }
    return this.toDocuments(pages);
  }
}
