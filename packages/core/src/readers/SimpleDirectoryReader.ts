import { Document } from "../Document";
import { BaseReader } from "./base";
import { CompleteFileSystem, walk } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";

export default class SimpleDirectoryReader implements BaseReader {
  async loadData(
    directoryPath: string,
    fs: CompleteFileSystem = DEFAULT_FS as CompleteFileSystem
  ): Promise<Document[]> {
    const docs: Document[] = [];
    for await (const filePath of walk(fs, directoryPath)) {
      try {
        const fileData = await fs.readFile(filePath);
        docs.push(new Document(fileData, directoryPath));
      } catch (e) {
        console.error(`Error reading file ${filePath}: ${e}`);
      }
    }
    return docs;
  }
}
