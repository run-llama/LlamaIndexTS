import type { BaseReader, Document, Metadata } from "llamaindex";
import {
  FILE_EXT_TO_READER,
  SimpleDirectoryReader,
  TextFileReader,
} from "llamaindex/readers/SimpleDirectoryReader";

class ZipReader implements BaseReader {
  loadData(...args: any[]): Promise<Document<Metadata>[]> {
    throw new Error("Implement me");
  }
}

const reader = new SimpleDirectoryReader();
const documents = await reader.loadData({
  directoryPath: "../data",
  defaultReader: new TextFileReader(),
  fileExtToReader: {
    ...FILE_EXT_TO_READER,
    zip: new ZipReader(),
  },
});

documents.forEach((doc) => {
  console.log(`document (${doc.id_}):`, doc.getText());
});
