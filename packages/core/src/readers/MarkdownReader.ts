import type { GenericFileSystem } from "@llamaindex/env";
import { defaultFS } from "@llamaindex/env";
import { Document } from "../Node.js";
import type { FileReader } from "./type.js";

type MarkdownTuple = [string | null, string];

/**
 * Extract text from markdown files.
 * Returns dictionary with keys as headers and values as the text between headers.
 */
export class MarkdownReader implements FileReader {
  private _removeHyperlinks: boolean;
  private _removeImages: boolean;

  /**
   * @param {boolean} [removeHyperlinks=true] - Indicates whether hyperlinks should be removed.
   * @param {boolean} [removeImages=true] - Indicates whether images should be removed.
   */
  constructor(removeHyperlinks: boolean = true, removeImages: boolean = true) {
    this._removeHyperlinks = removeHyperlinks;
    this._removeImages = removeImages;
  }

  /**
   * Convert a markdown file to a dictionary.
   * The keys are the headers and the values are the text under each header.
   * @param {string} markdownText - The markdown text to convert.
   * @returns {Array<MarkdownTuple>} - An array of tuples, where each tuple contains a header (or null) and its corresponding text.
   */
  markdownToTups(markdownText: string): MarkdownTuple[] {
    const markdownTups: MarkdownTuple[] = [];
    const lines = markdownText.split("\n");

    let currentHeader: string | null = null;
    let currentText = "";

    for (const line of lines) {
      const headerMatch = line.match(/^#+\s/);
      if (headerMatch) {
        if (currentHeader) {
          if (!currentText) {
            currentHeader += line + "\n";
            continue;
          }
          markdownTups.push([currentHeader, currentText]);
        }

        currentHeader = line;
        currentText = "";
      } else {
        currentText += line + "\n";
      }
    }
    markdownTups.push([currentHeader, currentText]);

    if (currentHeader) {
      // pass linting, assert keys are defined
      markdownTups.map((tuple) => [
        tuple[0]?.replace(/#/g, "").trim() || null,
        tuple[1].replace(/<.*?>/g, ""),
      ]);
    } else {
      markdownTups.map((tuple) => [tuple[0], tuple[1].replace(/<.*?>/g, "")]);
    }

    return markdownTups;
  }

  removeImages(content: string): string {
    const pattern = /!{1}\[\[(.*)\]\]/g;
    return content.replace(pattern, "");
  }

  removeHyperlinks(content: string): string {
    const pattern = /\[(.*?)\]\((.*?)\)/g;
    return content.replace(pattern, "$1");
  }

  parseTups(content: string): MarkdownTuple[] {
    let modifiedContent = content;
    if (this._removeHyperlinks) {
      modifiedContent = this.removeHyperlinks(modifiedContent);
    }
    if (this._removeImages) {
      modifiedContent = this.removeImages(modifiedContent);
    }
    return this.markdownToTups(modifiedContent);
  }

  async loadData(
    file: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[]> {
    const content = await fs.readFile(file);
    const tups = this.parseTups(content);
    const results: Document[] = [];
    for (const [header, value] of tups) {
      if (header) {
        results.push(
          new Document({
            text: `\n\n${header}\n${value}`,
          }),
        );
      } else {
        results.push(new Document({ text: value }));
      }
    }
    return results;
  }
}
