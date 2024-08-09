import { Document, FileReader } from "@llamaindex/core/schema";
/**
 * Extract the significant text from an arbitrary HTML document.
 * The contents of any head, script, style, and xml tags are removed completely.
 * The URLs for a[href] tags are extracted, along with the inner text of the tag.
 * All other tags are removed, and the inner text is kept intact.
 * Html entities (e.g., &amp;) are not decoded.
 */
export class HTMLReader extends FileReader {
  /**
   * Public method for this reader.
   * Required by BaseReader interface.
   * @param file Path/name of the file to be loaded.
   * @returns Promise<Document[]> A Promise object, eventually yielding zero or one Document parsed from the HTML content of the specified file.
   */
  async loadDataAsContent(fileContent: Uint8Array): Promise<Document[]> {
    const decoder = new TextDecoder("utf-8");
    const dataBuffer = decoder.decode(fileContent);
    const htmlOptions = this.getOptions();
    const content = await this.parseContent(dataBuffer, htmlOptions);
    return [new Document({ text: content })];
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
      // Keep the URLs for embedded links
      // cb: (tag: any, deleteFrom: number, deleteTo: number, insert: string, rangesArr: any, proposedReturn: string) => {
      //   let temp;
      //   if (
      //     tag.name === "a" &&
      //     tag.attributes &&
      //     tag.attributes.some((attr: any) => {
      //       if (attr.name === "href") {
      //         temp = attr.value;
      //         return true;
      //       }
      //     })
      //   ) {
      //     rangesArr.push([deleteFrom, deleteTo, `${temp} ${insert || ""}`]);
      //   } else {
      //     rangesArr.push(proposedReturn);
      //   }
      // },
    };
  }
}
