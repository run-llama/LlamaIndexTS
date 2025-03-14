import { PromptTemplate } from "@llamaindex/core/prompts";

export const defaultUserPrompt = new PromptTemplate({
  templateVars: ["query", "referenceAnswer", "generatedAnswer"],
  template: `
## User Query
{query}

## Reference Answer
{referenceAnswer}

## Generated Answer
{generatedAnswer}
`,
});

export type UserPrompt = PromptTemplate<
  ["query", "referenceAnswer", "generatedAnswer"]
>;

export const defaultCorrectnessSystemPrompt: CorrectnessSystemPrompt =
  new PromptTemplate({
    template: `You are an expert evaluation system for a question answering chatbot.

You are given the following information:
- a user query, and
- a generated answer

You may also be given a reference answer to use for reference in your evaluation.

Your job is to judge the relevance and correctness of the generated answer.
Output a single score that represents a holistic evaluation.
You must return your response in a line with only the score.
Do not return answers in any other format.
On a separate line provide your reasoning for the score as well.

Follow these guidelines for scoring:
- Your score has to be between 1 and 5, where 1 is the worst and 5 is the best.
- If the generated answer is not relevant to the user query,
you should give a score of 1.
- If the generated answer is relevant but contains mistakes,
you should give a score between 2 and 3.
- If the generated answer is relevant and fully correct,
you should give a score between 4 and 5.

Example Response:
4.0
The generated answer has the exact same metrics as the reference answer
but it is not as concise.
`,
  });

export type CorrectnessSystemPrompt = PromptTemplate<[]>;

export const defaultFaithfulnessRefinePrompt = new PromptTemplate({
  templateVars: ["query", "existingAnswer", "context"],
  template: `
We want to understand if the following information is present
in the context information: {query}
We have provided an existing YES/NO answer: {existingAnswer}
We have the opportunity to refine the existing answer
(only if needed) with some more context below.
------------
{context}
------------
If the existing answer was already YES, still answer YES.
If the information is present in the new context, answer YES.
Otherwise answer NO.
`,
});

export type FaithfulnessRefinePrompt = PromptTemplate<
  ["query", "existingAnswer", "context"]
>;

export const defaultFaithfulnessTextQaPrompt = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `
Please tell if a given piece of information
is supported by the context.
You need to answer with either YES or NO.
Answer YES if any of the context supports the information, even
if most of the context is unrelated.
Some examples are provided below.

Information: Apple pie is generally double-crusted.
Context: An apple pie is a fruit pie in which the principal filling
ingredient is apples.
Apple pie is often served with whipped cream, ice cream
('apple pie à la mode'), custard or cheddar cheese.
It is generally double-crusted, with pastry both above
and below the filling; the upper crust may be solid or
latticed (woven of crosswise strips).
Answer: YES
Information: Apple pies tastes bad.
Context: An apple pie is a fruit pie in which the principal filling
ingredient is apples.
Apple pie is often served with whipped cream, ice cream
('apple pie à la mode'), custard or cheddar cheese.
It is generally double-crusted, with pastry both above
and below the filling; the upper crust may be solid or
latticed (woven of crosswise strips).
Answer: NO
Information: {query}
Context: {context}
Answer:
`,
});

export type FaithfulnessTextQAPrompt = PromptTemplate<["query", "context"]>;

export type RelevancyEvalPrompt = PromptTemplate<["context", "query"]>;
export const defaultRelevancyEvalPrompt = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `Your task is to evaluate if the response for the query is in line with the context information provided.
You have two options to answer. Either YES/ NO.
Answer - YES, if the response for the query is in line with context information otherwise NO.
Query and Response: {query}
Context: {context}
Answer: `,
});

export const defaultRelevancyRefinePrompt = new PromptTemplate({
  templateVars: ["query", "existingAnswer", "contextMsg"],
  template: `We want to understand if the following query and response is
in line with the context information: 
{query}
We have provided an existing YES/NO answer: 
{existingAnswer}
We have the opportunity to refine the existing answer
(only if needed) with some more context below.
------------
{contextMsg}
------------
If the existing answer was already YES, still answer YES.
If the information is present in the new context, answer YES.
Otherwise answer NO.
`,
});

export type RelevancyRefinePrompt = PromptTemplate<
  ["query", "existingAnswer", "contextMsg"]
>;
