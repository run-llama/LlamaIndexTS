export const defaultUserPrompt = ({
  query,
  referenceAnswer,
  generatedAnswer,
}: {
  query: string;
  referenceAnswer: string;
  generatedAnswer: string;
}) => `
## User Query
${query}

## Reference Answer
${referenceAnswer}

## Generated Answer
${generatedAnswer}
`;

export type UserPrompt = typeof defaultUserPrompt;

export const defaultCorrectnessSystemPrompt =
  () => `You are an expert evaluation system for a question answering chatbot.

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
`;

export type CorrectnessSystemPrompt = typeof defaultCorrectnessSystemPrompt;
