import { serviceContextFromDefaults } from "../../ServiceContext.js";
import {
  TextNode,
  type BaseRetriever,
  type CallbackManager,
  type LLM,
  type NodeWithScore,
  type ObjectRetriever,
  type SQLDatabase,
  type ServiceContext,
} from "../../index.js";
import { QueryBundle } from "../../types.js";
import { defaultTextToSQLPrompt, type TextToSQLPrompt } from "./prompts.js";
import {
  DefaultSQLParser,
  SQLParserMode,
  SQLRetriever,
  type SQLTableSchema,
} from "./types.js";

export class NLSQLRetriever extends SQLRetriever implements BaseRetriever {
  sqlDatabase: SQLDatabase;
  sqlRetriever: SQLRetriever;
  sqlParser: DefaultSQLParser;
  textToSQLPrompt: TextToSQLPrompt;
  contextQueryKwargs: Record<string, any> | undefined;
  tables: any[] | string[] | undefined;
  tableRetriever: ObjectRetriever | undefined;
  contextStrPrefix: string | undefined;
  sqlParserMode: SQLParserMode;
  llm: LLM;
  serviceContext: ServiceContext;
  returnRaw: boolean;
  handleSQLErrors: boolean;
  sqlOnly: boolean;
  callbackManager: CallbackManager | undefined;
  verbose: boolean;
  getTables: any;

  constructor({
    sqlDatabase,
    textToSQLPrompt,
    contextQueryKwargs,
    tables,
    tableRetriever,
    contextStrPrefix,
    sqlParserMode,
    llm,
    serviceContext,
    returnRaw,
    handleSQLErrors,
    sqlOnly,
    callbackManager,
    verbose,
  }: {
    sqlDatabase: SQLDatabase;
    textToSQLPrompt?: TextToSQLPrompt;
    contextQueryKwargs?: Record<string, any>;
    tables?: any[] | string[];
    tableRetriever?: ObjectRetriever;
    contextStrPrefix?: string;
    sqlParserMode?: SQLParserMode;
    llm?: LLM;
    serviceContext?: ServiceContext;
    returnRaw?: boolean;
    handleSQLErrors?: boolean;
    sqlOnly?: boolean;
    callbackManager?: CallbackManager;
    verbose?: boolean;
  }) {
    super(sqlDatabase, returnRaw, callbackManager);

    this.sqlRetriever = new SQLRetriever(sqlDatabase, returnRaw);
    this.sqlDatabase = sqlDatabase;
    this.getTables = this.loadGetTablesFn(
      sqlDatabase,
      tables,
      contextQueryKwargs,
      tableRetriever,
    );
    this.contextStrPrefix = contextStrPrefix;
    this.serviceContext = serviceContext ?? serviceContextFromDefaults();
    this.textToSQLPrompt = textToSQLPrompt ?? defaultTextToSQLPrompt;
    this.sqlParserMode = sqlParserMode ?? SQLParserMode.DEFAULT;
    this.sqlParser = this.loadSQLParser(
      this.sqlParserMode,
      this.serviceContext,
    );
    this.handleSQLErrors = handleSQLErrors ?? true;
    this.sqlOnly = sqlOnly ?? false;
    this.verbose = verbose ?? false;
    this.returnRaw = returnRaw ?? false;
    this.llm = llm ?? this.serviceContext.llm;
  }

  _getPrompts() {
    return {
      textToSQLPrompt: this.textToSQLPrompt,
    };
  }

  _updatePrompts(prompts: Record<string, any>) {
    if ("textToSQLPrompt" in prompts) {
      this.textToSQLPrompt = prompts.textToSQLPrompt;
    }
  }

  _getPromptModules() {
    return {};
  }

  getServiceContext(): ServiceContext {
    return this.serviceContext;
  }

  loadSQLParser(sqlParserMode: SQLParserMode, serviceContext: ServiceContext) {
    if (sqlParserMode === SQLParserMode.DEFAULT) {
      return new DefaultSQLParser();
    } else {
      throw new Error(`Unknown SQL parser mode: ${sqlParserMode}`);
    }
  }

  loadGetTablesFn(
    sqlDatabase: SQLDatabase,
    tables: any[] | string[] | undefined,
    contextQueryKwargs: Record<string, any> | undefined,
    tableRetriever: ObjectRetriever | undefined,
  ) {
    contextQueryKwargs = contextQueryKwargs || {};

    if (tableRetriever) {
      return async (queryStr: string) =>
        await tableRetriever.retrieve(queryStr);
    } else {
      let tableNames: SQLTableSchema[] | string[];

      if (tables) {
        tableNames = tables.map((t) => t);
      } else {
        tableNames = Array.from(sqlDatabase.usableTableNames);
      }

      const contextStrs: string[] = [];

      const tableSchemas = tableNames.map((t, i) => {
        if (typeof t === "string") {
          return {
            tableName: t,
            ...(contextQueryKwargs
              ? { contextStr: contextQueryKwargs[t] }
              : {}),
          };
        }

        return {
          tableName: t.tableName,
          ...(contextQueryKwargs
            ? { contextStr: contextQueryKwargs[t.tableName] }
            : {}),
        };
      });

      return () => tableSchemas;
    }
  }

  async retrieveWithMetadata(strOrQueryBundle: string | QueryBundle): Promise<
    [
      NodeWithScore[],
      {
        sql_query: string;
      },
    ]
  > {
    const queryBundle =
      strOrQueryBundle instanceof QueryBundle
        ? strOrQueryBundle
        : new QueryBundle(strOrQueryBundle);
    const tableDescStr = await this.getTableContext(queryBundle);
    console.log(`> Table desc str: ${tableDescStr}`);

    if (this.verbose) {
      console.log(`> Table desc str: ${tableDescStr}`);
    }

    const response = await this.serviceContext?.llm?.complete({
      prompt: this.textToSQLPrompt({
        dialect: "sql",
        schema: tableDescStr,
        queryStr: queryBundle.queryStr,
      }),
    });

    if (!response) {
      throw new Error("No response from LLM");
    }

    const sqlQueryStr = this.sqlParser.parseResponseToSQL(
      response?.text,
      queryBundle,
    );

    console.log(`> Predicted SQL query: ${sqlQueryStr}`);
    if (this.verbose) {
      console.log(`> Predicted SQL query: ${sqlQueryStr}`);
    }

    let retrievedNodes: NodeWithScore[];
    let metadata: Record<string, unknown> = {};

    if (this.sqlOnly) {
      const sqlOnlyNode = new TextNode({ text: sqlQueryStr });
      retrievedNodes = [{ node: sqlOnlyNode }];
      metadata = {};
    } else {
      try {
        const retrieverResponse = await this.sqlRetriever.retrieveWithMetadata({
          queryStr: sqlQueryStr,
        });

        retrievedNodes = retrieverResponse[0];
        metadata = retrieverResponse[1];
      } catch (e) {
        if (this.handleSQLErrors) {
          const errNode = new TextNode({ text: `Error: ${e}` });
          retrievedNodes = [{ node: errNode }];
          metadata = {};
        } else {
          throw e;
        }
      }
    }
    return [retrievedNodes, { sql_query: sqlQueryStr, ...metadata }];
  }

  async retrieve(query: string): Promise<NodeWithScore[]> {
    const [retrievedNodes] = await this.retrieveWithMetadata(query);
    return retrievedNodes;
  }

  async getTableContext(queryBundle: QueryBundle) {
    console.log(await this.getTables);

    const tableSchemaObjs = this.getTables(queryBundle.queryStr);
    const contextStrs = [];
    if (this.contextStrPrefix) {
      contextStrs.push(this.contextStrPrefix);
    }
    for (const tableSchemaObj of tableSchemaObjs) {
      let tableInfo = await this.sqlDatabase.getSingleTableInfo(
        tableSchemaObj.tableName,
      );
      if (tableSchemaObj.contextStr) {
        const tableOptContext = ` The table description is: ${tableSchemaObj.contextStr}`;
        tableInfo += tableOptContext;
      }
      contextStrs.push(tableInfo);
    }
    return contextStrs.join("\n\n");
  }
}
