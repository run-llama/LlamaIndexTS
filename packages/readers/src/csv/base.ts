import { Document, FileReader } from "@llamaindex/core/schema";
import type { Options, parse } from "csv-parse";

/**
 * CSV parser
 */
export class CSVReader extends FileReader<Document> {
  static parse: typeof parse;

  private concatRows: boolean;
  private colJoiner: string;
  private rowJoiner: string;
  private config: Options;

  /**
   * Constructs a new instance of the class.
   * @param concatRows - Whether to concatenate all rows into one document.If set to False, a Document will be created for each row. `True` by default.
   * @param colJoiner - Separator to use for joining cols per row. Set to ", " by default.
   * @param rowJoiner - Separator to use for joining each row.Only used when `concat_rows=True`.Set to "\n" by default.
   */
  constructor(
    concatRows: boolean = true,
    colJoiner: string = ", ",
    rowJoiner: string = "\n",
    config?: Options,
  ) {
    super();
    this.concatRows = concatRows;
    this.colJoiner = colJoiner;
    this.rowJoiner = rowJoiner;
    this.config = config ?? {};
  }

  /**
   * Loads data from csv files
   * @param fileContent - The content of the file.
   * @returns An array of Documents.
   */
  async loadDataAsContent(fileContent: Uint8Array): Promise<Document[]> {
    const decoder = new TextDecoder("utf-8");
    const fileContentString = decoder.decode(fileContent);
    const parser = CSVReader.parse(fileContentString, this.config);
    const textList: string[] = [];
    for await (const record of parser) {
      textList.push(record.map((v: unknown) => `${v}`).join(this.colJoiner));
    }

    if (this.concatRows) {
      return [new Document({ text: textList.join(this.rowJoiner) })];
    } else {
      return textList.map((text) => new Document({ text }));
    }
  }
}
