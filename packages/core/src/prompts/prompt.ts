import type { ChatMessage, ToolMetadata } from "../llms";
import { PromptTemplate, type StringTemplate } from "./base";

export type TextQAPrompt = PromptTemplate<
  ["context", "query"]
>;
export type SummaryPrompt = PromptTemplate<
  ["context"]
>;
export type RefinePrompt = PromptTemplate<
  ["query", "existingAnswer", "context"]
>;
export type TreeSummarizePrompt = PromptTemplate<
  ["context", "query"]
>;
export type ChoiceSelectPrompt = PromptTemplate<
  ["context", "query"]
>;
export type SubQuestionPrompt = PromptTemplate<
  ["toolsStr", "queryStr"]
>;
export type CondenseQuestionPrompt = PromptTemplate<
  ["chatHistory", "question"]
>;
export type ContextSystemPrompt = PromptTemplate<
  ["context"]
>;
export type KeywordExtractPrompt = PromptTemplate<
  ["context"]
>;
export type QueryKeywordExtractPrompt = PromptTemplate<
  ["question"]
>;

export const defaultTextQAPrompt: TextQAPrompt = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `Context information is below.
---------------------
{context}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: {query}
Answer:`,
});

export const anthropicTextQaPrompt: TextQAPrompt = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `Context information:
<context>
{context}
</context>
Given the context information and not prior knowledge, answer the query.
Query: {query}`,
});

export const defaultSummaryPrompt: SummaryPrompt = new PromptTemplate({
  templateVars: ["context"],
  template: `Write a summary of the following. Try to use only the information provided. Try to include as many key details as possible.


{context}


SUMMARY:"""
`,
});

export const anthropicSummaryPrompt: SummaryPrompt = new PromptTemplate({
  templateVars: ["context"],
  template: `Summarize the following text. Try to use only the information provided. Try to include as many key details as possible.
<original-text>
{context}
</original-text>

SUMMARY:
`,
});

export const defaultRefinePrompt: RefinePrompt = new PromptTemplate({
  templateVars: ["query", "existingAnswer", "context"],
  template: `The original query is as follows: {query}
We have provided an existing answer: {existingAnswer}
We have the opportunity to refine the existing answer (only if needed) with some more context below.
------------
{context}
------------
Given the new context, refine the original answer to better answer the query. If the context isn't useful, return the original answer.
Refined Answer:`,
});

export const defaultTreeSummarizePrompt = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `Context information from multiple sources is below.
---------------------
{context}
---------------------
Given the information from multiple sources and not prior knowledge, answer the query.
Query: {query}
Answer:`,
});

export const defaultChoiceSelectPrompt = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `A list of documents is shown below. Each document has a number next to it along 
with a summary of the document. A question is also provided.
Respond with the numbers of the documents
you should consult to answer the question, in order of relevance, as well
as the relevance score. The relevance score is a number from 1-10 based on
how relevant you think the document is to the question.
Do not include any documents that are not relevant to the question.
Example format:
Document 1:
<summary of document 1>

Document 2:
<summary of document 2>

...

Document 10:\n<summary of document 10>

Question: <question>
Answer:
Doc: 9, Relevance: 7
Doc: 3, Relevance: 4
Doc: 7, Relevance: 3

Let's try this now:

{context}
Question: {query}
Answer:`,
});

export function buildToolsText(tools: ToolMetadata[]) {
  const toolsObj = tools.reduce<Record<string, string>>((acc, tool) => {
    acc[tool.name] = tool.description;
    return acc;
  }, {});

  return JSON.stringify(toolsObj, null, 4);
}

const exampleTools: ToolMetadata[] = [
  {
    name: "uber_10k",
    description: "Provides information about Uber financials for year 2021",
  },
  {
    name: "lyft_10k",
    description: "Provides information about Lyft financials for year 2021",
  },
];

const exampleQueryStr = `Compare and contrast the revenue growth and EBITDA of Uber and Lyft for year 2021`;

const exampleOutput = [
  {
    subQuestion: "What is the revenue growth of Uber",
    toolName: "uber_10k",
  },
  {
    subQuestion: "What is the EBITDA of Uber",
    toolName: "uber_10k",
  },
  {
    subQuestion: "What is the revenue growth of Lyft",
    toolName: "lyft_10k",
  },
  {
    subQuestion: "What is the EBITDA of Lyft",
    toolName: "lyft_10k",
  },
] as const;

export const defaultSubQuestionPrompt: SubQuestionPrompt = new PromptTemplate({
  templateVars: ["toolsStr", "queryStr"],
  template: `Given a user question, and a list of tools, output a list of relevant sub-questions that when composed can help answer the full user question:

# Example 1
<Tools>
\`\`\`json
${buildToolsText(exampleTools)}
\`\`\`

<User Question>
${exampleQueryStr}

<Output>
\`\`\`json
${JSON.stringify(exampleOutput, null, 4)}
\`\`\`

# Example 2
<Tools>
\`\`\`json
{toolsStr}
\`\`\`

<User Question>
{queryStr}

<Output>
`,
});

export const defaultCondenseQuestionPrompt = new PromptTemplate({
  templateVars: ["chatHistory", "question"],
  template: `Given a conversation (between Human and Assistant) and a follow up message from Human, rewrite the message to be a standalone question that captures all relevant context from the conversation.

<Chat History>
{chatHistory}

<Follow Up Message>
{question}

<Standalone question>
`,
});

export function messagesToHistoryStr(messages: ChatMessage[]) {
  return messages.reduce((acc, message) => {
    acc += acc ? "\n" : "";
    if (message.role === "user") {
      acc += `Human: ${message.content}`;
    } else {
      acc += `Assistant: ${message.content}`;
    }
    return acc;
  }, "");
}

export const defaultContextSystemPrompt = new PromptTemplate({
  templateVars: ["context"],
  template: `Context information is below.
---------------------
{context}
---------------------`,
});

export const defaultKeywordExtractPrompt = new PromptTemplate({
  templateVars: ["maxKeywords", "context"],
  template: `
Some text is provided below. Given the text, extract up to {maxKeywords} keywords from the text. Avoid stopwords.
---------------------
{context}
---------------------
Provide keywords in the following comma-separated format: 'KEYWORDS: <keywords>'
`,
}).partialFormat({
  maxKeywords: "10",
});

export const defaultQueryKeywordExtractPrompt = new PromptTemplate({
  templateVars: ["maxKeywords", "question"],
  template: `(
  "A question is provided below. Given the question, extract up to {maxKeywords} "
  "keywords from the text. Focus on extracting the keywords that we can use "
  "to best lookup answers to the question. Avoid stopwords."
  "---------------------"
  "{question}"
  "---------------------"
  "Provide keywords in the following comma-separated format: 'KEYWORDS: <keywords>'"
)`,
}).partialFormat({
  maxKeywords: "10",
});
