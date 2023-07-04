import { BaseNode, MetadataMode } from "../../Node";
import _ from "lodash";

export type NodeFormatterFunction = (summaryNodes: BaseNode[]) => string;
export const defaultFormatNodeBatchFn: NodeFormatterFunction = (
  summaryNodes: BaseNode[]
): string => {
  return summaryNodes
    .map((node, idx) => {
      return `
Document ${idx + 1}:
${node.getContent(MetadataMode.LLM)}
        `.trim();
    })
    .join("\n\n");
};

// map from document number to its relevance score
export type ChoiceSelectParseResult = { [docNumber: number]: number };
export type ChoiceSelectParserFunction = (
  answer: string,
  numChoices: number,
  raiseErr?: boolean
) => ChoiceSelectParseResult;

export const defaultParseChoiceSelectAnswerFn: ChoiceSelectParserFunction = (
  answer: string,
  numChoices: number,
  raiseErr: boolean = false
): ChoiceSelectParseResult => {
  // split the line into the answer number and relevance score portions
  const lineTokens: string[][] = answer
    .split("\n")
    .map((line: string) => {
      let lineTokens = line.split(",");
      if (lineTokens.length !== 2) {
        if (raiseErr) {
          throw new Error(
            `Invalid answer line: ${line}. Answer line must be of the form: answer_num: <int>, answer_relevance: <float>`
          );
        } else {
          return null;
        }
      }
      return lineTokens;
    })
    .filter((lineTokens) => !_.isNil(lineTokens)) as string[][];

  // parse the answer number and relevance score
  return lineTokens.reduce(
    (parseResult: ChoiceSelectParseResult, lineToken: string[]) => {
      try {
        let docNum = parseInt(lineToken[0].split(":")[1].trim());
        let answerRelevance = parseFloat(lineToken[1].split(":")[1].trim());
        if (docNum < 1 || docNum > numChoices) {
          if (raiseErr) {
            throw new Error(
              `Invalid answer number: ${docNum}. Answer number must be between 1 and ${numChoices}`
            );
          } else {
            parseResult[docNum] = answerRelevance;
          }
        }
      } catch (e) {
        if (raiseErr) {
          throw e;
        }
      }
      return parseResult;
    },
    {}
  );
};
