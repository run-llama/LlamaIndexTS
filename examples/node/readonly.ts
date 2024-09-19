import { execSync } from "child_process";
import {
  PDFReader,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

const STORAGE_DIR = "./cache";

async function main() {
  // write the index to disk
  const storageContext = await storageContextFromDefaults({
    persistDir: `${STORAGE_DIR}`,
  });
  const reader = new PDFReader();
  const documents = await reader.loadData("data/brk-2022.pdf");
  await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });
  console.log("wrote index to disk - now trying to read it");
  // make index dir read only
  execSync(`chmod -R 555 ${STORAGE_DIR}`);
  // reopen index
  const readOnlyStorageContext = await storageContextFromDefaults({
    persistDir: `${STORAGE_DIR}`,
  });
  await VectorStoreIndex.init({
    storageContext: readOnlyStorageContext,
  });
  console.log("read only index successfully opened");
}

main().catch(console.error);
