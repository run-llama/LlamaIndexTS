import { Document } from "../Node";
import { GenericFileSystem } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";
import { BaseReader } from "./base";

/**
 * Read the text of a PDF
 */
export class PDFReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = DEFAULT_FS,
  ): Promise<Document[]> {
    const fileContent = await fs.readFile(file);
    const data = await readPDF(fileContent);
    return [new Document({ text: data.text, id_: file })];
  }
}

// NOTE: the following code is taken from https://www.npmjs.com/package/pdf-parse and modified
async function readPage(pageData: any) {
  //check documents https://mozilla.github.io/pdf.js/
  const textContent = await pageData.getTextContent({
    //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
    normalizeWhitespace: false,
    //do not attempt to combine same line TextItem's. The default value is `false`.
    disableCombineTextItems: false,
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
  pagerender: readPage,
  max: 0,
  //check https://mozilla.github.io/pdf.js/getting_started/
  version: "v1.10.100",
};

async function readPDF(content: string, options = PDF_DEFAULT_OPTIONS) {
  const PDFJS = await loadPDFJS();

  const doc = await PDFJS.getDocument(content);
  const metaData = await doc.getMetadata().catch(() => null);
  const counter =
    options.max === 0 ? doc.numPages : Math.max(options.max, doc.numPages);

  let text = "";

  for (let i = 1; i <= counter; i++) {
    try {
      const pageData = await doc.getPage(i);
      const pageText = await options.pagerender(pageData);

      text += `\n\n${pageText}`;
    } catch (err) {
      console.log(err);
    }
  }

  doc.destroy();

  return {
    numpages: doc.numPages,
    numrender: counter,
    info: metaData?.info,
    metadata: metaData?.metadata,
    text,
    version: PDFJS.version,
  };
}

async function loadPDFJS() {
  // @ts-ignore
  const { default: module } = await import("pdfjs-dist/build/pdf.js");
  // Disable workers to avoid yet another cross-origin issue (workers need
  // the URL of the script to be loaded, and dynamically loading a cross-origin
  // script does not work).
  module.disableWorker = true;
  const { getDocument, version } = module;
  return { getDocument, version };
}
