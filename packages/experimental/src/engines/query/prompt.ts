export const defaultJsonPathPrompt = ({
  query,
  schema,
}: {
  query: string;
  schema: string;
}) => `
We have provided a JSON schema below:
${schema}
Given a task, respond with a JSON Path query that can retrieve data from a JSON value that matches the schema.
Task: ${query}
JSONPath: 
`;

export type JSONPathPrompt = typeof defaultJsonPathPrompt;

export const defaultResponseSynthesizePrompt = ({
  query,
  jsonSchema,
  jsonPath,
  jsonPathValue,
}: {
  query: string;
  jsonSchema: string;
  jsonPath: string;
  jsonPathValue: string;
}) => `
Given a query, synthesize a response to satisfy the query using the JSON results. Only include details that are relevant to the query. If you don't know the answer, then say that.
JSON Schema: ${jsonSchema}
JSON Path: ${jsonPath}
Value at path: ${jsonPathValue}
Query: ${query}
Response: 
`;

export type ResponseSynthesisPrompt = typeof defaultResponseSynthesizePrompt;
