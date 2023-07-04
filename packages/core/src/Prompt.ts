/**
 * A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
 * NOTE this is a different interface compared to LlamaIndex Python
 * NOTE 2: we default to empty string to make it easy to calculate prompt sizes
 */
export type SimplePrompt = (input: Record<string, string>) => string;

/*
DEFAULT_TEXT_QA_PROMPT_TMPL = (
    "Context information is below. \n"
    "---------------------\n"
    "{context_str}"
    "\n---------------------\n"
    "Given the context information and not prior knowledge, "
    "answer the question: {query_str}\n"
)
*/

export const defaultTextQaPrompt: SimplePrompt = (input) => {
  const { context = "", query = "" } = input;

  return `Context information is below.
---------------------
${context}
---------------------
Given the context information and not prior knowledge, answer the question: ${query}
`;
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

export const defaultSummaryPrompt: SimplePrompt = (input) => {
  const { context = "" } = input;

  return `Write a summary of the following. Try to use only the information provided. Try to include as many key details as possible.


${context}


SUMMARY:"""
`;
};

/*
DEFAULT_REFINE_PROMPT_TMPL = (
    "The original question is as follows: {query_str}\n"
    "We have provided an existing answer: {existing_answer}\n"
    "We have the opportunity to refine the existing answer "
    "(only if needed) with some more context below.\n"
    "------------\n"
    "{context_msg}\n"
    "------------\n"
    "Given the new context, refine the original answer to better "
    "answer the question. "
    "If the context isn't useful, return the original answer."
)
*/

export const defaultRefinePrompt: SimplePrompt = (input) => {
  const { query = "", existingAnswer = "", context = "" } = input;

  return `The original question is as follows: ${query}
We have provided an existing answer: ${existingAnswer}
We have the opportunity to refine the existing answer (only if needed) with some more context below.
------------
${context}
------------
Given the new context, refine the original answer to better answer the question. If the context isn't useful, return the original answer.`;
};

export const defaultChoiceSelectPrompt: SimplePrompt = (input) => {
  const { context = "", query = "" } = input;

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
