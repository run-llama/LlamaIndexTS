import type { GenericFileSystem } from "@llamaindex/env";
import { createSHA256, defaultFS } from "@llamaindex/env";
import { Document } from "../Node.js";
import type { BaseReader } from "./type.js";

/**
 * Read the text of a PDF
 */
export class PDFReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[]> {
    const content = await fs.readRawFile(file);
    const text = await readPDF(content);
    return text.map((text) => {
      const sha256 = createSHA256();
      sha256.update(text);
      return new Document({
        text,
        id_: sha256.digest(),
      });
    });
  }
}

async function readPDF(data: Buffer): Promise<string[]> {
  const parser = await import("pdf2json").then(
    ({ default: Pdfparser }) => new Pdfparser(null, 1),
  );
  const text = await new Promise<string>((resolve, reject) => {
    parser.on("pdfParser_dataError", (error) => {
      reject(error);
    });
    parser.on("pdfParser_dataReady", () => {
      resolve((parser as any).getRawTextContent() as string);
    });
    parser.parseBuffer(data);
  });
  return text.split(/----------------Page \(\d+\) Break----------------/g);
}
