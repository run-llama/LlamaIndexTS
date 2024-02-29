import knex from "knex";
import { NLSQLQueryEngine, SQLDatabase } from "./index.js";

async function main() {
  const engine = knex({
    client: "sqlite3", // or 'better-sqlite3'
    connection: {
      filename: ":memory:",
    },
  });

  const db = new SQLDatabase({
    engine,
    schema: undefined,
    metadata: {},
    ignoreTables: undefined,
    includeTables: ["test_table_1"],
    sampleRowsInTableInfo: 3,
    indexesInTableInfo: true,
    customTableInfo: undefined,
    maxStringLength: 100,
  });

  const tableName = "test_table_1";

  await engine.schema.createTable(tableName, async (table) => {
    table.increments("id");
    table.string("name");
    table.string("comment");
    table.string("author");

    await db.insertIntoTable(tableName, {
      comment: "this is a test1",
      author: "emanuel",
    });
    await db.insertIntoTable(tableName, {
      comment: "this is a test2",
      author: "alex",
    });
    await db.insertIntoTable(tableName, {
      comment: "this is a test3",
      author: "yi",
    });
    await db.insertIntoTable(tableName, {
      comment: "this is a test4",
      author: "logan ",
    });

    const engine = new NLSQLQueryEngine({
      sqlDatabase: db,
      tables: ["test_table_1"],
      verbose: true,
    });

    const a = await engine.query({
      query: "Who is the author of the first comment?",
    });

    console.log({ a });
  });
}

main().then(() => [
  // process.exit(0)
]);
