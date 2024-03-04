import knex from "knex";
import {
  NLSQLQueryEngine,
  OpenAI,
  SQLDatabase,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  const llm = new OpenAI({
    model: "gpt-4",
  });

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
      author: "alex",
    });

    const ctx = serviceContextFromDefaults({
      llm,
    });

    const engine = new NLSQLQueryEngine({
      sqlDatabase: db,
      tables: ["test_table_1"],
      verbose: true,
      serviceContext: ctx,
      synthesizeResponse: true,
    });

    const response = await engine.query({
      query: "What's the comment from author yi and emanuel?",
    });

    console.log({ response });

    process.exit(0);
  });
}

main().then(() => [
  // process.exit(0)
]);
