import {
  FILE_EXT_TO_READER,
  SimpleDirectoryReader,
} from "@llamaindex/readers/directory";

export const DATA_DIR = "./data";

export function getExtractors() {
  return FILE_EXT_TO_READER;
}

export async function getDocuments() {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: DATA_DIR,
  });
  // Set private=false to mark the document as public (required for filtering)
  for (const document of documents) {
    document.metadata = {
      ...document.metadata,
      private: "false",
    };
  }
  return documents;
}
