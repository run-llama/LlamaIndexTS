export const defaultTextToSQLPrompt = ({
  dialect,
  schema,
  queryStr,
}: {
  dialect: string;
  schema: string;
  queryStr: string;
}) => `Given an input question, first create a syntactically correct ${dialect}
query to run, then look at the results of the query and return the answer.
You can order the results by a relevant column to return the most
interesting examples in the database.
Never query for all the columns from a specific table, only ask for a
few relevant columns given the question.
Pay attention to use only the column names that you can see in the schema
description.
Be careful to not query for columns that do not exist.
Pay attention to which column is in which table.
Also, qualify column names with the table name when needed.
You are required to use the following format, each taking one line:
Question: Question here
SQLQuery: SQL Query to run
SQLResult: Result of the SQLQuery
Answer: Final answer here
Only use tables listed below.
${schema}
Question: ${queryStr}
SQLQuery:
`;

export type TextToSQLPrompt = typeof defaultTextToSQLPrompt;
