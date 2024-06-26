import type { Document } from "@llamaindex/core/schema";
import { fs, path } from "@llamaindex/env";

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: unknown[]): Promise<Document[]>;
}

/**
 * A FileReader takes file paths and imports data into Document objects.
 */
export abstract class FileReader implements BaseReader {
  abstract loadDataAsContent(
    fileContent: Uint8Array,
    fileName?: string,
  ): Promise<Document[]>;

  async loadData(filePath: string): Promise<Document[]> {
    // XXX: create a new Uint8Array to prevent "Please provide binary data as `Uint8Array`, rather than `Buffer`." error in PDFReader
    const fileContent = new Uint8Array(await fs.readFile(filePath));
    const fileName = path.basename(filePath);
    const docs = await this.loadDataAsContent(fileContent, fileName);
    docs.forEach(FileReader.addMetaData(filePath));
    return docs;
  }

  static addMetaData(filePath: string) {
    return (doc: Document, index: number) => {
      // generate id as loadDataAsContent is only responsible for the content
      doc.id_ = `${filePath}_${index + 1}`;
      doc.metadata["file_path"] = path.resolve(filePath);
      doc.metadata["file_name"] = path.basename(filePath);
    };
  }
}

// For LlamaParseReader.ts

export type ResultType = "text" | "markdown" | "json";
export type Language =
  | "abq"
  | "ady"
  | "af"
  | "ang"
  | "ar"
  | "as"
  | "ava"
  | "az"
  | "be"
  | "bg"
  | "bh"
  | "bho"
  | "bn"
  | "bs"
  | "ch_sim"
  | "ch_tra"
  | "che"
  | "cs"
  | "cy"
  | "da"
  | "dar"
  | "de"
  | "en"
  | "es"
  | "et"
  | "fa"
  | "fr"
  | "ga"
  | "gom"
  | "hi"
  | "hr"
  | "hu"
  | "id"
  | "inh"
  | "is"
  | "it"
  | "ja"
  | "kbd"
  | "kn"
  | "ko"
  | "ku"
  | "la"
  | "lbe"
  | "lez"
  | "lt"
  | "lv"
  | "mah"
  | "mai"
  | "mi"
  | "mn"
  | "mr"
  | "ms"
  | "mt"
  | "ne"
  | "new"
  | "nl"
  | "no"
  | "oc"
  | "pi"
  | "pl"
  | "pt"
  | "ro"
  | "ru"
  | "rs_cyrillic"
  | "rs_latin"
  | "sck"
  | "sk"
  | "sl"
  | "sq"
  | "sv"
  | "sw"
  | "ta"
  | "tab"
  | "te"
  | "th"
  | "tjk"
  | "tl"
  | "tr"
  | "ug"
  | "uk"
  | "ur"
  | "uz"
  | "vi";
