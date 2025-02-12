// load-docs.ts
import { PGVectorStore } from "@llamaindex/postgres";
import {
  SimpleDirectoryReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import fs from "node:fs/promises";

async function getSourceFilenames(sourceDir: string) {
  return await fs
    .readdir(sourceDir)
    .then((fileNames) => fileNames.map((file) => sourceDir + "/" + file));
}

function callback(
  category: string,
  name: string,
  status: unknown,
  message: string = "",
): boolean {
  console.log(category, name, status, message);
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function main(args: any) {
  const sourceDir: string = args.length > 2 ? args[2] : "../data";

  console.log(`Finding documents in ${sourceDir}`);
  const fileList = await getSourceFilenames(sourceDir);
  const count = fileList.length;
  console.log(`Found ${count} files`);

  console.log(`Importing contents from ${count} files in ${sourceDir}`);
  const fileName = "";
  try {
    // Passing callback fn to the ctor here
    // will enable looging to console.
    // See callback fn, defined above.
    const rdr = new SimpleDirectoryReader(callback);
    const docs = await rdr.loadData({ directoryPath: sourceDir });

    const pgvs = new PGVectorStore({
      clientConfig: {
        connectionString: process.env.PG_CONNECTION_STRING,
      },
    });
    pgvs.setCollection(sourceDir);
    await pgvs.clearCollection();

    const ctx = await storageContextFromDefaults({ vectorStore: pgvs });

    console.debug("  - creating vector store");
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });
    console.debug("  - done.");
  } catch (err) {
    console.error(fileName, err);
    console.log(
      "If your PGVectorStore init failed, make sure to set env vars for PGUSER or USER, PGHOST, PGPORT and PGPASSWORD as needed.",
    );
    process.exit(1);
  }

  console.log(
    "Done. Try running query.ts to ask questions against the imported embeddings.",
  );
  process.exit(0);
}

void main(process.argv).catch((err) => console.error(err));
