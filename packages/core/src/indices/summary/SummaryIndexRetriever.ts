import _ from "lodash";
import { globalsHelper } from "../../GlobalsHelper";
import { NodeWithScore } from "../../Node";
import { ChoiceSelectPrompt, defaultChoiceSelectPrompt } from "../../Prompt";
import { BaseRetriever } from "../../Retriever";
import { ServiceContext } from "../../ServiceContext";
import { Event } from "../../callbacks/CallbackManager";
import { SummaryIndex } from "./SummaryIndex";
import {
  ChoiceSelectParserFunction,
  NodeFormatterFunction,
  defaultFormatNodeBatchFn,
  defaultParseChoiceSelectAnswerFn,
} from "./utils";

/**
 * Simple retriever for SummaryIndex that returns all nodes
 */
export class SummaryIndexRetriever implements BaseRetriever {
  index: SummaryIndex;

  constructor(index: SummaryIndex) {
    this.index = index;
  }

  async retrieve(query: string, parentEvent?: Event): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const nodes = await this.index.docStore.getNodes(nodeIds);
    const result = nodes.map((node) => ({
      node: node,
      score: 1,
    }));

    if (this.index.serviceContext.callbackManager.onRetrieve) {
      this.index.serviceContext.callbackManager.onRetrieve({
        query,
        nodes: result,
        event: globalsHelper.createEvent({
          parentEvent,
          type: "retrieve",
        }),
      });
    }

    return result;
  }

  getServiceContext(): ServiceContext {
    return this.index.serviceContext;
  }
}

/**
 * LLM retriever for SummaryIndex which lets you select the most relevant chunks.
 */
export class SummaryIndexLLMRetriever implements BaseRetriever {
  index: SummaryIndex;
  choiceSelectPrompt: ChoiceSelectPrompt;
  choiceBatchSize: number;
  formatNodeBatchFn: NodeFormatterFunction;
  parseChoiceSelectAnswerFn: ChoiceSelectParserFunction;
  serviceContext: ServiceContext;

  // eslint-disable-next-line max-params
  constructor(
    index: SummaryIndex,
    choiceSelectPrompt?: ChoiceSelectPrompt,
    choiceBatchSize: number = 10,
    formatNodeBatchFn?: NodeFormatterFunction,
    parseChoiceSelectAnswerFn?: ChoiceSelectParserFunction,
    serviceContext?: ServiceContext,
  ) {
    this.index = index;
    this.choiceSelectPrompt = choiceSelectPrompt || defaultChoiceSelectPrompt;
    this.choiceBatchSize = choiceBatchSize;
    this.formatNodeBatchFn = formatNodeBatchFn || defaultFormatNodeBatchFn;
    this.parseChoiceSelectAnswerFn =
      parseChoiceSelectAnswerFn || defaultParseChoiceSelectAnswerFn;
    this.serviceContext = serviceContext || index.serviceContext;
  }

  async retrieve(query: string, parentEvent?: Event): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const results: NodeWithScore[] = [];

    for (let idx = 0; idx < nodeIds.length; idx += this.choiceBatchSize) {
      const nodeIdsBatch = nodeIds.slice(idx, idx + this.choiceBatchSize);
      const nodesBatch = await this.index.docStore.getNodes(nodeIdsBatch);

      const fmtBatchStr = this.formatNodeBatchFn(nodesBatch);
      const input = { context: fmtBatchStr, query: query };
      const rawResponse = (
        await this.serviceContext.llm.complete({
          prompt: this.choiceSelectPrompt(input),
        })
      ).text;

      // parseResult is a map from doc number to relevance score
      const parseResult = this.parseChoiceSelectAnswerFn(
        rawResponse,
        nodesBatch.length,
      );
      const choiceNodeIds = nodeIdsBatch.filter((nodeId, idx) => {
        return `${idx}` in parseResult;
      });

      const choiceNodes = await this.index.docStore.getNodes(choiceNodeIds);
      const nodeWithScores = choiceNodes.map((node, i) => ({
        node: node,
        score: _.get(parseResult, `${i + 1}`, 1),
      }));

      results.push(...nodeWithScores);
    }

    if (this.serviceContext.callbackManager.onRetrieve) {
      this.serviceContext.callbackManager.onRetrieve({
        query,
        nodes: results,
        event: globalsHelper.createEvent({
          parentEvent,
          type: "retrieve",
        }),
      });
    }

    return results;
  }

  getServiceContext(): ServiceContext {
    return this.serviceContext;
  }
}

// Legacy
export type ListIndexRetriever = SummaryIndexRetriever;
export type ListIndexLLMRetriever = SummaryIndexLLMRetriever;
