import { parseEpub } from "@gxl/epub-parser";
import { Document } from "../Node";
import { GenericFileSystem } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";
import { BaseReader } from "./base";
/**
 * Read the text of a Epub file
 */
export class EpubReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = DEFAULT_FS,
  ): Promise<Document[]> {
    const dataBuffer = (await fs.readFile(file)) as any;
    const book = await parseEpub(dataBuffer, {
      type: "buffer",
      expand: true,
    });
    const sections = book.sections ?? [];
    const header = `${book.info?.author}\n${book.info?.publisher}\n${book.info?.title}`;
    const options = this.getOptions();
    const results = await Promise.all(
      sections.map((section) => {
        return new Promise(async (resolve) => {
          const parsed = await this.parseContent(section.htmlString, options);
          resolve(parsed);
        });
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
  async parseContent(html: string, options: any = {}): Promise<string> {
    const { stripHtml } = await import("string-strip-html"); // ESM only
    return stripHtml(html).result;
  }

  /**
   * Wrapper for our configuration options passed to string-strip-html library
   * @see https://codsen.com/os/string-strip-html/examples
   * @returns An object of options for the underlying library
   */
  getOptions() {
    return {
      skipHtmlDecoding: true,
      stripTogetherWithTheirContents: [
        "script", // default
        "style", // default
        "xml", // default
        "head", // <-- custom-added
      ],
    };
  }
}
