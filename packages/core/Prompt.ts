/**
 * A prompt is a function that takes a dictionary of inputs and returns a string.
 * NOTE this is a different interface compared to LlamaIndex Python
 */
export type Prompt = (input: { [key: string]: string }) => string;

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

export const defaultTextQaPrompt: Prompt = (input: {
  [key: string]: string;
}) => {
  const { context, query } = input;

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

export const defaultSummaryPrompt: Prompt = (input: {
  [key: string]: string;
}) => {
  const { context } = input;

  return `Write a summary of the following. Try to use only the information provided. Try to include as many key details as possible.


${input.context}


SUMMARY:"""
`;
};
