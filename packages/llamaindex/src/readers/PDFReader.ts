import { fs } from "@llamaindex/env";
import { Document } from "../Node.js";
import { FileReader } from "./type.js";

/**
 * Read the text of a PDF
 */
export class PDFReader extends FileReader {
  async loadData(file: string): Promise<Document[]> {
    const content = await fs.readFile(file);
    return this.loadDataAsContent(new Uint8Array(content.buffer));
  }

  async loadDataAsContent(content: Uint8Array): Promise<Document[]> {
    const { totalPages, text } = await readPDF(content);
    return text.map((text, page) => {
      const metadata = {
        page_number: page + 1,
        total_pages: totalPages,
      };
      return new Document({ text, metadata });
    });
  }
}

async function readPDF(data: Uint8Array): Promise<{
  totalPages: number;
  text: string[];
}> {
  const { extractText } = await import("unpdf");
  return (await extractText(data)) as {
    totalPages: number;
    text: string[];
  };
}
