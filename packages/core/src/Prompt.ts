import { SubQuestion } from "./engines/query/types";
import { ChatMessage } from "./llm/types";
import { ToolMetadata } from "./types";

/**
 * A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
 * NOTE this is a different interface compared to LlamaIndex Python
 * NOTE 2: we default to empty string to make it easy to calculate prompt sizes
 */
export type SimplePrompt = (
  input: Record<string, string | undefined>,
) => string;

/*
DEFAULT_TEXT_QA_PROMPT_TMPL = (
    "Context information is below.\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "Given the context information and not prior knowledge, "
    "answer the query.\n"
    "Query: {query_str}\n"
    "Answer: "
)
*/

export const defaultTextQaPrompt = ({ context = "", query = "" }) => {
  return `Context information is below.
---------------------
${context}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: ${query}
Answer:`;
};

export type TextQaPrompt = typeof defaultTextQaPrompt;

export const anthropicTextQaPrompt: TextQaPrompt = ({
  context = "",
  query = "",
}) => {
  return `Context information:
<context>
${context}
</context>
Given the context information and not prior knowledge, answer the query.
Query: ${query}`;
};

/*
DEFAULT_SUMMARY_PROMPT_TMPL = (
    "Write a summary of the following. Try to use only the "
    "information provided. "
    "Try to include as many key details as possible.\n"
    "\n"
    "\n"
    "{context_str}\n"
    "\n"
    "\n"
    'SUMMARY:"""\n'
)
*/

export const defaultSummaryPrompt = ({ context = "" }) => {
  return `Write a summary of the following. Try to use only the information provided. Try to include as many key details as possible.


${context}


SUMMARY:"""
`;
};

export type SummaryPrompt = typeof defaultSummaryPrompt;

export const anthropicSummaryPrompt: SummaryPrompt = ({ context = "" }) => {
  return `Summarize the following text. Try to use only the information provided. Try to include as many key details as possible.
<original-text>
${context}
</original-text>

SUMMARY:
`;
};

/*
DEFAULT_REFINE_PROMPT_TMPL = (
    "The original query is as follows: {query_str}\n"
    "We have provided an existing answer: {existing_answer}\n"
    "We have the opportunity to refine the existing answer "
    "(only if needed) with some more context below.\n"
    "------------\n"
    "{context_msg}\n"
    "------------\n"
    "Given the new context, refine the original answer to better "
    "answer the query. "
    "If the context isn't useful, return the original answer.\n"
    "Refined Answer: "
)
*/

export const defaultRefinePrompt = ({
  query = "",
  existingAnswer = "",
  context = "",
}) => {
  return `The original query is as follows: ${query}
We have provided an existing answer: ${existingAnswer}
We have the opportunity to refine the existing answer (only if needed) with some more context below.
------------
${context}
------------
Given the new context, refine the original answer to better answer the query. If the context isn't useful, return the original answer.
Refined Answer:`;
};

export type RefinePrompt = typeof defaultRefinePrompt;

/*
DEFAULT_TREE_SUMMARIZE_TMPL = (
  "Context information from multiple sources is below.\n"
  "---------------------\n"
  "{context_str}\n"
  "---------------------\n"
  "Given the information from multiple sources and not prior knowledge, "
  "answer the query.\n"
  "Query: {query_str}\n"
  "Answer: "
)
*/

export const defaultTreeSummarizePrompt = ({ context = "", query = "" }) => {
  return `Context information from multiple sources is below.
---------------------
${context}
---------------------
Given the information from multiple sources and not prior knowledge, answer the query.
Query: ${query}
Answer:`;
};

export type TreeSummarizePrompt = typeof defaultTreeSummarizePrompt;

export const defaultChoiceSelectPrompt = ({ context = "", query = "" }) => {
  return `A list of documents is shown below. Each document has a number next to it along 
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

${context}
Question: ${query}
Answer:`;
};

export type ChoiceSelectPrompt = typeof defaultChoiceSelectPrompt;

/*
PREFIX = """\
Given a user question, and a list of tools, output a list of relevant sub-questions \
that when composed can help answer the full user question:

"""


example_query_str = (
    "Compare and contrast the revenue growth and EBITDA of Uber and Lyft for year 2021"
)
example_tools = [
    ToolMetadata(
        name="uber_10k",
        description="Provides information about Uber financials for year 2021",
    ),
    ToolMetadata(
        name="lyft_10k",
        description="Provides information about Lyft financials for year 2021",
    ),
]
example_tools_str = build_tools_text(example_tools)
example_output = [
    SubQuestion(
        sub_question="What is the revenue growth of Uber", tool_name="uber_10k"
    ),
    SubQuestion(sub_question="What is the EBITDA of Uber", tool_name="uber_10k"),
    SubQuestion(
        sub_question="What is the revenue growth of Lyft", tool_name="lyft_10k"
    ),
    SubQuestion(sub_question="What is the EBITDA of Lyft", tool_name="lyft_10k"),
]
example_output_str = json.dumps([x.dict() for x in example_output], indent=4)

EXAMPLES = (
    """\
# Example 1
<Tools>
```json
{tools_str}
```

<User Question>
{query_str}


<Output>
```json
{output_str}
```

""".format(
        query_str=example_query_str,
        tools_str=example_tools_str,
        output_str=example_output_str,
    )
    .replace("{", "{{")
    .replace("}", "}}")
)

SUFFIX = """\
# Example 2
<Tools>
```json
{tools_str}
```

<User Question>
{query_str}

<Output>
"""

DEFAULT_SUB_QUESTION_PROMPT_TMPL = PREFIX + EXAMPLES + SUFFIX
*/

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

const exampleOutput: SubQuestion[] = [
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
];

export const defaultSubQuestionPrompt = ({ toolsStr = "", queryStr = "" }) => {
  return `Given a user question, and a list of tools, output a list of relevant sub-questions that when composed can help answer the full user question:

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
${toolsStr}
\`\`\`

<User Question>
${queryStr}

<Output>
`;
};

export type SubQuestionPrompt = typeof defaultSubQuestionPrompt;

// DEFAULT_TEMPLATE = """\
// Given a conversation (between Human and Assistant) and a follow up message from Human, \
// rewrite the message to be a standalone question that captures all relevant context \
// from the conversation.

// <Chat History>
// {chat_history}

// <Follow Up Message>
// {question}

// <Standalone question>
// """

export const defaultCondenseQuestionPrompt = ({
  chatHistory = "",
  question = "",
}) => {
  return `Given a conversation (between Human and Assistant) and a follow up message from Human, rewrite the message to be a standalone question that captures all relevant context from the conversation.

<Chat History>
${chatHistory}

<Follow Up Message>
${question}

<Standalone question>
`;
};

export type CondenseQuestionPrompt = typeof defaultCondenseQuestionPrompt;

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

export const defaultContextSystemPrompt = ({ context = "" }) => {
  return `Context information is below.
---------------------
${context}
---------------------`;
};

export type ContextSystemPrompt = typeof defaultContextSystemPrompt;

export const defaultKeywordExtractPrompt = ({
  context = "",
  maxKeywords = 10,
}) => {
  return `
Some text is provided below. Given the text, extract up to ${maxKeywords} keywords from the text. Avoid stopwords.
---------------------
${context}
---------------------
Provide keywords in the following comma-separated format: 'KEYWORDS: <keywords>'
`;
};

export type KeywordExtractPrompt = typeof defaultKeywordExtractPrompt;

export const defaultQueryKeywordExtractPrompt = ({
  question = "",
  maxKeywords = 10,
}) => {
  return `(
  "A question is provided below. Given the question, extract up to ${maxKeywords} "
  "keywords from the text. Focus on extracting the keywords that we can use "
  "to best lookup answers to the question. Avoid stopwords."
  "---------------------"
  "${question}"
  "---------------------"
  "Provide keywords in the following comma-separated format: 'KEYWORDS: <keywords>'"
)`;
};
export type QueryKeywordExtractPrompt = typeof defaultQueryKeywordExtractPrompt;
