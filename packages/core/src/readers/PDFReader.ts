import { Document } from "../Node";
import { defaultFS } from "../env";
import { GenericFileSystem } from "../storage/FileSystem";
import { BaseReader } from "./base";

/**
 * Read the text of a PDF
 */
export class PDFReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[]> {
    const content = (await fs.readFile(file)) as any;
    if (!(content instanceof Buffer)) {
      console.warn(`PDF File ${file} can only be loaded using the Node FS`);
      return [];
    }
    const data = new Uint8Array(
      content.buffer,
      content.byteOffset,
      content.byteLength,
    );
    const pdf = await readPDF(data);
    return [new Document({ text: pdf.text, id_: file })];
  }
}

// NOTE: the following code is taken from https://www.npmjs.com/package/pdf-parse and modified
async function readPage(pageData: any) {
  //check documents https://mozilla.github.io/pdf.js/
  const textContent = await pageData.getTextContent({
    includeMarkedContent: false,
  });

  let lastY = null,
    text = "";
  //https://github.com/mozilla/pdf.js/issues/8963
  //https://github.com/mozilla/pdf.js/issues/2140
  //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
  //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
  for (const item of textContent.items) {
    if (lastY == item.transform[5] || !lastY) {
      text += item.str;
    } else {
      text += "\n" + item.str;
    }
    lastY = item.transform[5];
  }
  return text;
}

const PDF_DEFAULT_OPTIONS = {
  max: 0,
};

async function readPDF(data: Uint8Array, options = PDF_DEFAULT_OPTIONS) {
  const { getDocument, version } = await import("pdfjs-dist");

  const doc = await getDocument({ data }).promise;
  const metaData = await doc.getMetadata().catch(() => null);
  const counter =
    options.max === 0 ? doc.numPages : Math.max(options.max, doc.numPages);

  let text = "";

  for (let i = 1; i <= counter; i++) {
    try {
      const pageData = await doc.getPage(i);
      const pageText = await readPage(pageData);

      text += `\n\n${pageText}`;
    } catch (err) {
      console.log(err);
    }
  }

  await doc.destroy();

  return {
    numpages: doc.numPages,
    numrender: counter,
    info: metaData?.info,
    metadata: metaData?.metadata,
    text,
    version,
  };
}
