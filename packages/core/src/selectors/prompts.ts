import { PromptTemplate } from "../index.js";

export const defaultSingleSelectPrompt = (): string => {
  return `Some choices are given below. It is provided in a numbered list (1 to {{numChoices}), where each item in the list corresponds to a summary.
---------------------
{{contextList}}
---------------------
Using only the choices above and not prior knowledge, return the choice that is most relevant to the question: '{{queryStr}}'
`;
};

export const defaultSingleSelectPromptTemplate = new PromptTemplate<{
  numChoices: number;
  contextList: string;
  queryStr: string;
}>(defaultSingleSelectPrompt);

export type SingleSelectPromptTemplate =
  typeof defaultSingleSelectPromptTemplate;

export type SingleSelectPrompt = typeof defaultSingleSelectPrompt;

export const defaultMultiSelectPrompt = (
  numChoices: number,
  contextList: string,
  queryStr: string,
  maxOutputs: number,
) => {
  return `Some choices are given below. It is provided in a numbered list (1 to ${numChoices}), where each item in the list corresponds to a summary.
---------------------
${contextList}
---------------------
Using only the choices above and not prior knowledge, return the top choices (no more than ${maxOutputs}, but only select what is needed) that are most relevant to the question: '${queryStr}'
`;
};

export const defaultMultiSelectPromptTemplate = new PromptTemplate<{
  numChoices: number;
  contextList: string;
  queryStr: string;
  maxOutputs: number;
}>(defaultMultiSelectPrompt);

export type MultiSelectPromptTemplate = typeof defaultMultiSelectPromptTemplate;

export type MultiSelectPrompt = typeof defaultMultiSelectPrompt;
