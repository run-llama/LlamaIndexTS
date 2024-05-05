import type { CompleteFileSystem } from "@llamaindex/env";
import type { Document } from "../Node.js";

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: unknown[]): Promise<Document[] | Document[][]>;
}

/**
 * A reader takes file paths and imports data into Document objects.
 */
export interface FileReader extends BaseReader {
  loadData(filePath: string, fs?: CompleteFileSystem): Promise<Document[]>;
}

/**
 * A reader takes single and multiple file paths as well as a directory Path and imports data into an array of Document objects.
 */
export interface MultiReader extends BaseReader {
  loadData(filePath: string, fs?: CompleteFileSystem): Promise<Document[]>;
  loadData(filePaths: string[], fs?: CompleteFileSystem): Promise<Document[][]>;
  loadData(
    directoryPath: string,
    fs?: CompleteFileSystem,
  ): Promise<Document[][]>;
}

// For LlamaParseReader

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
