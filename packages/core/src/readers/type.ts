import type { Document } from "../Node.js";

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: unknown[]): Promise<Document[]>;
}

/**
 * A reader takes file paths and imports data into Document objects.
 */
export interface FileReader extends BaseReader {
  loadData(filePath: string): Promise<Document[]>;
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
