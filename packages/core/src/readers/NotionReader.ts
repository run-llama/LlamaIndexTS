import { Client } from "@notionhq/client";
import { crawler, Crawler, Pages, pageToString } from "notion-md-crawler";
import { Document } from "../Node";
import { BaseReader } from "./base";

export class NotionReader implements BaseReader {
  private crawl: ReturnType<Crawler>;

  constructor(options: { client: Client }) {
    this.crawl = crawler({ client: options.client });
  }

  toDocuments(pages: Pages): Document[] {
    return Object.values(pages).map((page) => {
      const text = pageToString(page);
      return new Document({ text, metadata: page.metadata });
    });
  }

  async loadPages(rootPageId: string): Promise<Pages> {
    return this.crawl(rootPageId);
  }

  async loadData(rootPageId: string): Promise<Document[]> {
    const pages = await this.loadPages(rootPageId);
    return this.toDocuments(pages);
  }
}
