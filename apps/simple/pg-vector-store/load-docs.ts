// load-docs.ts
import fs from 'fs/promises';
import { SimpleDirectoryReader, storageContextFromDefaults, VectorStoreIndex } from 'llamaindex';
// import { VectorStoreIndex } from "../../../packages/core/src/indices/vectorStore/VectorStoreIndex";
// import { SimpleDirectoryReader } from "../../../packages/core/src/readers/SimpleDirectoryReader";
import { PGVectorStore } from "../../../packages/core/src/storage/vectorStore/PGVectorStore";
// import { storageContextFromDefaults } from '../../../packages/core/src/storage';


async function getSourceFilenames(sourceDir: string) {
    return await fs.readdir(sourceDir)
        .then(
            (fileNames) => fileNames.map(
                (file) => sourceDir + '/' + file
            )
        );
}

function callback(category: string, name: string, status: any, message: string = ''): boolean {
    console.log(category, name, status, message);
    return true;
}

async function main(args: any) {

    const sourceDir: string = args.length > 2 ? args[2] : '../data';

    // Create Document object with essay
    console.log(`Finding documents in ${sourceDir}`);
    const fileList = await getSourceFilenames(sourceDir);
    const count = fileList.length;
    console.log(`Found ${count} files`);

    console.log(`Importing contents from ${count} files in ${sourceDir}`);
    var fileName = '';
    try {

      // Passing callback fn to the ctor here
      // will enable looging to console.
      // See callback fn, defined above.
      const rdr = new SimpleDirectoryReader(callback);
      const docs = await rdr.loadData({ directoryPath: sourceDir });

      const pgvs = new PGVectorStore();
      pgvs.setCollection(sourceDir);
      pgvs.clearCollection();

      const ctx = await storageContextFromDefaults(
          { vectorStore: pgvs }
      );

      console.debug('  - creating vector store');
      const index = await VectorStoreIndex.fromDocuments(docs, { storageContext: ctx });
      console.debug('  - done.');

    } catch (err) {
        console.error(fileName, err);
        console.log("If your PGVectorStore init failed, make sure to set env vars for PGUSER or USER, PGHOST, PGPORT and PGPASSWORD as needed.");
        process.exit(1);
    }

    console.log("Done. Try running query.ts to ask questions against the imported embeddings.");
    process.exit(0);
}

main(process.argv).catch((err) => console.error(err));