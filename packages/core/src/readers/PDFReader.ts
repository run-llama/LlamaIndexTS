import { fs } from "@llamaindex/env";
import { Document } from "../Node.js";
import type { BaseReader } from "./type.js";

/**
 * Read the text of a PDF
 */
export class PDFReader implements BaseReader {
  async loadData(file: string): Promise<Document[]> {
    const content = await fs.readFile(file);
    const pages = await readPDF(content);
    return pages.map((text, page) => {
      const id_ = `${file}_${page + 1}`;
      const metadata = {
        page_number: page + 1,
      };
      return new Document({ text, id_, metadata });
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
