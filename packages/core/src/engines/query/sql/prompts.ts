export const defaultResponseSynthesisPrompt = ({
  queryStr,
  sqlQuery,
  contextStr,
}: {
  queryStr: string;
  sqlQuery: string;
  contextStr: string;
}) => `
Given an input question, synthesize a response from the query results.
Query: ${queryStr}
SQL: ${sqlQuery}
SQL Response: ${contextStr}
Response: 
`;

export type ResponseSynthesisPrompt = typeof defaultResponseSynthesisPrompt;
