import { Document, FileReader } from "@llamaindex/core/schema";
import * as XLSX from "xlsx";

interface ExcelReaderOptions {
  /** concatenate all rows into one document (default: true) */
  concatRows?: boolean;
  /** which sheet(s) to read; string name or zero-based index */
  sheetSpecifier?: string | number | undefined;
  /** what to put between each field (default: ", ") */
  fieldSeparator?: string;
  /** what to put between key and value (default: ":") */
  keyValueSeparator?: string;
}

/**
 * ExcelReader reads an XLSX file from a Uint8Array (or Buffer) and
 * produces Document instances, either one per sheet (concatenated)
 * or one per row per sheet.
 */
export class ExcelReader extends FileReader<Document> {
  private concatRows: boolean;
  private sheetSpecifier?: string | number | undefined;
  private fieldSeparator: string;
  private keyValueSeparator: string;

  /**
   * @param concatRows        If true, all rows in a sheet become one Document;
   *                          otherwise one Document per row.
   * @param sheetSpecifier    Name or zero-based index of the sheet to read;
   *                          undefined = all sheets.
   * @param fieldSeparator    Separator between fields, e.g. ", ".
   * @param keyValueSeparator Separator between key & value, e.g. ": ".
   */
  constructor({
    concatRows = true,
    sheetSpecifier = undefined,
    fieldSeparator = ", ",
    keyValueSeparator = ":",
  }: ExcelReaderOptions = {}) {
    super();
    this.concatRows = concatRows;
    this.sheetSpecifier = sheetSpecifier;
    this.fieldSeparator = fieldSeparator;
    this.keyValueSeparator = keyValueSeparator;
  }

  async loadDataAsContent(content: Uint8Array): Promise<Document[]> {
    // Parse workbook from raw bytes
    const workbook = XLSX.read(content, { type: "array" });

    // Choose which sheets to process
    let sheets = workbook.SheetNames;
    if (this.sheetSpecifier !== undefined) {
      if (typeof this.sheetSpecifier === "number") {
        const name = sheets[this.sheetSpecifier];
        sheets = name ? [name] : [];
      } else {
        sheets = sheets.includes(this.sheetSpecifier)
          ? [this.sheetSpecifier]
          : [];
      }
    }

    const docs: Document[] = [];

    for (const name of sheets) {
      const ws = workbook.Sheets[name];

      if (!ws) {
        continue; // Skip if worksheet is undefined
      }

      // Convert sheet to JSON rows, using headers from first row
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, {
        defval: "N/A",
      });

      const textLines: string[] = rows.map((r) =>
        Object.entries(r)
          .map(([h, v]) => `${h}${this.keyValueSeparator}${v}`)
          .join(this.fieldSeparator),
      );

      if (this.concatRows) {
        docs.push(
          new Document({
            text: textLines.join("\n"),
            metadata: { sheetName: name },
          }),
        );
      } else {
        textLines.forEach((text) =>
          docs.push(new Document({ text, metadata: { sheetName: name } })),
        );
      }
    }

    return docs;
  }
}
