export const defaultResponseSynthesisPrompt = ({
  query,
  context,
  sqlQuery,
}: {
  query?: string;
  context?: string;
  sqlQuery: string;
}) => `
Given an input question, synthesize a response from the query results.
Query: ${query}
SQL: ${sqlQuery}
SQL Response: ${context}
Response: 
`;

export type ResponseSynthesisPrompt = typeof defaultResponseSynthesisPrompt;
