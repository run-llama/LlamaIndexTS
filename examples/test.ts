import knex from "knex";
import { SQLDatabase } from "llamaindex";

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
    includeTables: ["test_table"],
    sampleRowsInTableInfo: 3,
    indexesInTableInfo: true,
    customTableInfo: undefined,
    maxStringLength: 100,
  });

  const tableName = "test_table";

  await engine.schema.createTable(tableName, () => {});

  await db.insertIntoTable(tableName, {
    name: "test1",
    comment: "this is a test1",
  });
  await db.insertIntoTable(tableName, {
    name: "test2",
    comment: "this is a test2",
  });
  await db.insertIntoTable(tableName, {
    name: "test3",
    comment: "this is a test3",
  });
  await db.insertIntoTable(tableName, {
    name: "test4",
    comment: "this is a test4",
  });
}

main();
