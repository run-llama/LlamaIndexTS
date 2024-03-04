import knex from "knex";

type SQLDatabaseParams = {
  engine: knex.Knex;
  schema: string | undefined;
  metadata: any;
  ignoreTables: string[] | undefined;
  includeTables: string[] | undefined;
  sampleRowsInTableInfo: number;
  indexesInTableInfo: boolean;
  customTableInfo: Record<string, any> | undefined;
  maxStringLength: number;
};

export class SQLDatabase {
  engine: knex.Knex;
  schema: string | undefined;
  metadata: any;
  inspector: knex.Knex;
  allTables: Set<string>;
  includeTables: Set<string>;
  ignoreTables: Set<string>;
  usableTables: Set<string>;
  sampleRowsInTableInfo: number;
  indexesInTableInfo: boolean;
  customTableInfo: Record<string, any> | undefined;
  maxStringLength: number;

  constructor({
    engine,
    schema,
    metadata,
    ignoreTables,
    includeTables,
    sampleRowsInTableInfo,
    indexesInTableInfo,
    customTableInfo,
    maxStringLength,
  }: SQLDatabaseParams) {
    this.engine = engine;
    this.schema = schema;
    this.metadata = metadata;
    this.inspector = engine;
    this.allTables = new Set(["test_table_1"]);
    this.includeTables = new Set(includeTables || []);
    this.ignoreTables = new Set(ignoreTables || []);
    this.usableTables = new Set();
    this.sampleRowsInTableInfo = sampleRowsInTableInfo;
    this.indexesInTableInfo = indexesInTableInfo;
    this.customTableInfo = customTableInfo;
    this.maxStringLength = maxStringLength;
  }

  get usableTableNames(): string[] {
    if (this.includeTables.size > 0) {
      return Array.from(this.includeTables);
    }
    return Array.from(this.allTables);
  }

  async getTableColumns(tableName: string) {
    return await this.inspector(tableName).columnInfo();
  }

  async getSingleTableInfo(tableName: string) {
    const columns = await this.getTableColumns(tableName);

    const columnStr = Object.keys(columns)
      .map((column) => {
        return `${column} (${columns[column].type})`;
      })
      .join(", ");

    return `Table '${tableName}' has columns: ${columnStr}.`;
  }

  insertIntoTable(tableName: string, data: Record<string, any>): Promise<void> {
    return this.engine(tableName).insert(data);
  }

  truncateWord(content: any, length: number, suffix = "..."): string {
    if (typeof content !== "string" || length <= 0) {
      return content;
    }

    if (content.length <= length) {
      return content;
    }

    return (
      content
        .slice(0, length - suffix.length - 1)
        .split(" ")
        .slice(0, -1)
        .join(" ") + suffix
    );
  }

  async runSQL(
    command: string,
  ): Promise<[string, { result: any[]; colKeys: string[] }]> {
    return this.engine.raw(command).then((result: any) => {
      if (result.length > 0) {
        const truncatedResults = result.map((row: any) =>
          this.truncateWord(row, this.maxStringLength),
        );
        return [
          JSON.stringify(truncatedResults),
          { result: truncatedResults, colKeys: Object.keys(result[0]) },
        ];
      }
      return ["", { result: [], colKeys: [] }];
    });
  }

  async getTableInfo(tableName: string): Promise<string> {
    const columns = await this.getTableColumns(tableName);
    const columnStr = Object.keys(columns)
      .map((column: any) => {
        const comment = column.COMMENT ? `'${column.COMMENT}'` : "";
        return `${column.COLUMN_NAME} (${column.DATA_TYPE}): ${comment}`;
      })
      .join(", ");
    return `Table '${tableName}' has columns: ${columnStr}.`;
  }
}
