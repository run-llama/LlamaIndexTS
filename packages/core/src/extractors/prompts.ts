export const defaultKeywordExtractorPromptTemplate = ({
  context_str,
  keywords,
}: {
  context_str: string;
  keywords: number;
}) => `
  /${context_str}. Give ${keywords} unique keywords for this \
  document. Format as comma separated. Keywords:
`;

export const defaultTitleExtractorPromptTemplate = ({
  context_str,
}: {
  context_str: string;
}) => `
  /${context_str}. Give a title that summarizes all of the unique entities, titles or themes found in the context. Title:
`;

export const defaultTitleCombinePromptTemplate = ({
  context_str,
}: {
  context_str: string;
}) => `
  /${context_str}. Based on the above candidate titles and content, \
  what is the comprehensive title for this document? Title:
`;

export const defaultQuestionAnswerPromptTemplate = ({
  context_str,
  num_questions,
}: {
  context_str: string;
  num_questions: number;
}) => `
  /${context_str}. Given the contextual information, \
  generate ${num_questions} questions this context can provide \
  specific answers to which are unlikely to be found elsewhere.

  Higher-level summaries of surrounding context may be provided \
  as well. Try using these summaries to generate better questions \
  that this context can answer.
`;

export const defaultSummaryExtractorPromptTemplate = ({
  context_str,
}: {
  context_str: string;
}) => `
  /${context_str}. Summarize the key topics and entities of the section. \
  Summary:
`;
