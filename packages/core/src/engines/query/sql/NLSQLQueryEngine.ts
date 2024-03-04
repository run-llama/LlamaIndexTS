import {
  NLSQLRetriever,
  type SQLDatabase,
  type ServiceContext,
} from "../../../index.js";
import type { TextToSQLPrompt } from "../../../retriever/sql/prompts.js";
import { BaseSQLTableQueryEngine } from "./types.js";

type NLSQLQueryEngineParams = {
  sqlDatabase: SQLDatabase;
  textToSQLPrompt?: TextToSQLPrompt;
  contextQueryKwargs?: any | null;
  synthesizeResponse?: boolean;
  responseSynthesisPrompt?: any | null;
  tables?: any[] | string[] | undefined;
  serviceContext?: ServiceContext | undefined;
  contextStrPrefix?: string | undefined;
  sqlOnly?: boolean;
  verbose?: boolean;
};

export class NLSQLQueryEngine extends BaseSQLTableQueryEngine {
  _sqlRetriever: NLSQLRetriever;

  constructor({
    sqlDatabase,
    textToSQLPrompt,
    contextQueryKwargs = null,
    synthesizeResponse = true,
    responseSynthesisPrompt = null,
    tables,
    serviceContext,
    contextStrPrefix,
    sqlOnly = false,
    verbose = false,
  }: NLSQLQueryEngineParams) {
    super({
      synthesizeResponse,
      responseSynthesisPrompt,
      serviceContext,
      verbose,
    });

    this._sqlRetriever = new NLSQLRetriever({
      sqlDatabase,
      textToSQLPrompt,
      contextQueryKwargs,
      tables,
      contextStrPrefix,
      serviceContext,
      sqlOnly,
      verbose,
    });
  }

  get sqlRetriever(): NLSQLRetriever {
    return this._sqlRetriever;
  }
}
