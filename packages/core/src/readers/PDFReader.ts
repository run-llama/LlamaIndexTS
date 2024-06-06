import { Document } from "../Node.js";
import { FileReader } from "./type.js";

/**
 * Read the text of a PDF
 */
export class PDFReader extends FileReader {
  async loadDataAsContent(fileContent: Buffer): Promise<Document[]> {
    const pages = await readPDF(fileContent);
    return pages.map((text, page) => {
      const metadata = {
        page_number: page + 1,
      };
      return new Document({ text, metadata });
    });
  }
}

async function readPDF(data: Buffer): Promise<string[]> {
  const parser = await import("pdf2json").then(
    ({ default: Pdfparser }) => new Pdfparser(null, true),
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
