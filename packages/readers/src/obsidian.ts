import { type BaseReader, Document } from "@llamaindex/core/schema";
import * as fs from "node:fs";
import path from "node:path";
import { MarkdownReader } from "./markdown";

export class ObsidianReader implements BaseReader<Document> {
  protected inputDir: string;
  protected docs: Document[] = [];

  constructor(inputDir: string) {
    this.inputDir = inputDir;
  }

  private async processPath(file: fs.Dirent, filepath: string) {
    if (file.isDirectory() && !file.name.startsWith(".")) {
      await this.readFromPath(filepath);
    } else if (file.isFile() && file.name.endsWith(".md")) {
      await this.convertToDocuments(filepath);
    } else {
      console.log(`Skipping ${filepath}`);
    }
  }

  private async readFromPath(dir: string) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const filepath = path.join(dir, file.name);
      await this.processPath(file, filepath);
    }
  }

  private async convertToDocuments(filepath: string) {
    const content = await new MarkdownReader().loadData(filepath);
    this.docs.push(...content);
  }

  async loadData(): Promise<Document[]> {
    await this.readFromPath(this.inputDir);
    return this.docs;
  }
}
