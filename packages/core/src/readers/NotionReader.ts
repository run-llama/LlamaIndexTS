import type { Crawler, CrawlerOptions, Page } from "notion-md-crawler";
import { crawler, pageToString } from "notion-md-crawler";
import { Document } from "../Node.js";
import type { BaseReader } from "./type.js";

type NotionReaderOptions = Pick<CrawlerOptions, "client" | "serializers">;

/**
 * Notion pages are retrieved recursively and converted to Document objects.
 * Notion Database can also be loaded, and [the serialization method can be customized](https://github.com/TomPenguin/notion-md-crawler/tree/main).
 *
 * [Note] To use this reader, must be created the Notion integration must be created in advance
 * Please refer to [this document](https://www.notion.so/help/create-integrations-with-the-notion-api) for details.
 */
export class NotionReader implements BaseReader {
  private readonly crawl: ReturnType<Crawler>;

  /**
   * Constructor for the NotionReader class
   * @param {NotionReaderOptions} options - Configuration options for the reader
   */
  constructor({ client, serializers }: NotionReaderOptions) {
    this.crawl = crawler({ client, serializers });
  }

  /**
   * Converts Pages to an array of Document objects
   * @param {Page} pages - The Notion pages to convert (Return value of `loadPages`)
   * @returns {Document[]} An array of Document objects
   */
  toDocuments(pages: Page[]): Document[] {
    return Object.values(pages).map((page) => {
      const text = pageToString(page);
      return new Document({
        id_: page.metadata.id, // Use the Notion-provided UUID for the document
        text,
        metadata: page.metadata,
      });
    });
  }

  /**
   * Loads recursively the Notion page with the specified root page ID.
   * @param {string} rootPageId - The root Notion page ID
   * @returns {Promise<Page[]>} A Promise that resolves to a Pages object(Convertible with the `toDocuments` method)
   */
  async loadPages(rootPageId: string): Promise<Page[]> {
    const iter = this.crawl(rootPageId);
    const pages: Page[] = [];
    for await (const result of iter) {
      if (result.success) {
        pages.push(result.page);
      } else {
        console.error(
          `Failed to load page (${result.failure.parentId}): ${result.failure.reason}`,
        );
      }
    }
    return pages;
  }

  /**
   * Loads recursively Notion pages and converts them to an array of Document objects
   * @param {string} rootPageId - The root Notion page ID
   * @returns {Promise<Document[]>} A Promise that resolves to an array of Document objects
   */
  async loadData(rootPageId: string): Promise<Document[]> {
    const pages = await this.loadPages(rootPageId);
    return this.toDocuments(pages);
  }
}
