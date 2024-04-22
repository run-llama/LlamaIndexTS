import { parseEpub } from "@gxl/epub-parser";
import type { GenericFileSystem } from "@llamaindex/env";
import { defaultFS } from "@llamaindex/env";
import { Document } from "../Node.js";
import type { BaseReader } from "./type.js";
/**
 * Read the text of a Epub file
 */
export class EpubReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[]> {
    const dataBuffer = (await fs.readFile(file)) as any;
    const book = await parseEpub(dataBuffer, {
      type: "buffer",
      expand: true,
    });
    const sections = book.sections ?? [];
    const header = `${book.info?.author}\n${book.info?.publisher}\n${book.info?.title}`;
    const results = await Promise.all(
      sections.map(async (section) => {
        return await this.parseContent(section.htmlString);
      }),
    );
    return [
      new Document({ text: `${header}\n${results.join("\n")}`, id_: file }),
    ];
  }

  /**
   * Wrapper for string-strip-html usage.
   * @param html Raw HTML content to be parsed.
   * @param options An object of options for the underlying library
   * @see getOptions
   * @returns The HTML content, stripped of unwanted tags and attributes
   */
  async parseContent(html: string): Promise<string> {
    const { stripHtml } = await import("string-strip-html"); // ESM only
    return stripHtml(html, {
      skipHtmlDecoding: true,
      stripTogetherWithTheirContents: [
        "script", // default
        "style", // default
        "xml", // default
        "head", // <-- custom-added
      ],
    }).result;
  }
}
