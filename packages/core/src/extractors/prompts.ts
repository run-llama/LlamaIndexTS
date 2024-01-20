export interface DefaultPromptTemplate {
  contextStr: string;
}

export interface DefaultKeywordExtractorPromptTemplate
  extends DefaultPromptTemplate {
  keywords: number;
}

export interface DefaultQuestionAnswerPromptTemplate
  extends DefaultPromptTemplate {
  numQuestions: number;
}

export interface DefaultNodeTextTemplate {
  metadataStr: string;
  content: string;
}

export const defaultKeywordExtractorPromptTemplate = ({
  contextStr = "",
  keywords = 5,
}: DefaultKeywordExtractorPromptTemplate) => `
  ${contextStr}. Give ${keywords} unique keywords for thiss
  document. Format as comma separated. Keywords:
`;

export const defaultTitleExtractorPromptTemplate = (
  { contextStr = "" }: DefaultPromptTemplate = {
    contextStr: "",
  },
) => `
  ${contextStr}. Give a title that summarizes all of the unique entities, titles or themes found in the context. Title:
`;

export const defaultTitleCombinePromptTemplate = (
  { contextStr = "" }: DefaultPromptTemplate = {
    contextStr: "",
  },
) => `
  ${contextStr}. Based on the above candidate titles and content,s
  what is the comprehensive title for this document? Title:
`;

export const defaultQuestionAnswerPromptTemplate = (
  { contextStr = "", numQuestions = 5 }: DefaultQuestionAnswerPromptTemplate = {
    contextStr: "",
    numQuestions: 5,
  },
) => `
  ${contextStr}. Given the contextual information,s
  generate ${numQuestions} questions this context can provides
  specific answers to which are unlikely to be found elsewhere.

  Higher-level summaries of surrounding context may be provideds
  as well. Try using these summaries to generate better questionss
  that this context can answer.
`;

export const defaultSummaryExtractorPromptTemplate = (
  { contextStr = "" }: DefaultPromptTemplate = {
    contextStr: "",
  },
) => `
  ${contextStr}. Summarize the key topics and entities of the section.s
  Summary:
`;

export const defaultNodeTextTemplate = ({
  metadataStr = "",
  content = "",
}: {
  metadataStr?: string;
  content?: string;
} = {}) => `[Excerpt from document]
${metadataStr}
Excerpt:
-----
${content}
-----
`;
