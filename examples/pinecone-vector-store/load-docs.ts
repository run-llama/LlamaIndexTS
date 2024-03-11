// load-docs.ts
import fs from "fs/promises";
import {
  PineconeVectorStore,
  SimpleDirectoryReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

async function getSourceFilenames(sourceDir: string) {
  return await fs
    .readdir(sourceDir)
    .then((fileNames) => fileNames.map((file) => sourceDir + "/" + file));
}

function callback(
  category: string,
  name: string,
  status: any,
  message: string = "",
): boolean {
  console.log(category, name, status, message);
  return true;
}

async function main(args: any) {
  const sourceDir: string = args.length > 2 ? args[2] : "../data";

  console.log(`Finding documents in ${sourceDir}`);
  const fileList = await getSourceFilenames(sourceDir);
  const count = fileList.length;
  console.log(`Found ${count} files`);

  console.log(`Importing contents from ${count} files in ${sourceDir}`);
  var fileName = "";
  try {
    // Passing callback fn to the ctor here
    // will enable looging to console.
    // See callback fn, defined above.
    const rdr = new SimpleDirectoryReader(callback);
    const docs = await rdr.loadData({ directoryPath: sourceDir });

    const pcvs = new PineconeVectorStore();

    const ctx = await storageContextFromDefaults({ vectorStore: pcvs });

    console.debug("  - creating vector store");
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });
    console.debug("  - done.");
  } catch (err) {
    console.error(fileName, err);
    console.log(
      "If your PineconeVectorStore connection failed, make sure to set env vars for PINECONE_API_KEY and PINECONE_ENVIRONMENT.  If the upserts failed, try setting PINECONE_CHUNK_SIZE to limit the content sent per chunk",
    );
    process.exit(1);
  }

  console.log(
    "Done. Try running query.ts to ask questions against the imported embeddings.",
  );
  process.exit(0);
}

main(process.argv).catch((err) => console.error(err));
