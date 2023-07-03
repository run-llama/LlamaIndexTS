import { BaseRetriever } from "../../Retriever";
import { NodeWithScore } from "../../Node";
import { ListIndex } from "./ListIndex";
import { ServiceContext } from "../../ServiceContext";
import {
  defaultFormatNodeBatchFn,
  defaultParseChoiceSelectAnswerFn,
} from "./utils";
import { SimplePrompt, defaultChoiceSelectPrompt } from "../../Prompt";

/**
 * Simple retriever for ListIndex that returns all nodes
 */
export class ListIndexRetriever implements BaseRetriever {
  index: ListIndex;

  constructor(index: ListIndex) {
    this.index = index;
  }

  async aretrieve(query: string): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const nodes = await this.index.docStore.getNodes(nodeIds);
    return nodes.map((node) => ({
      node: node,
    }));
  }
}

/**
 * LLM retriever for ListIndex.
 */
export class ListIndexLLMRetriever implements BaseRetriever {
  index: ListIndex;
  choiceSelectPrompt: SimplePrompt;
  choiceBatchSize: number;
  formatNodeBatchFn: Function;
  parseChoiceSelectAnswerFn: Function;
  serviceContext: ServiceContext;

  constructor(
    index: ListIndex,
    choiceSelectPrompt?: SimplePrompt,
    choiceBatchSize: number = 10,
    formatNodeBatchFn?: Function,
    parseChoiceSelectAnswerFn?: Function,
    serviceContext?: ServiceContext
  ) {
    this.index = index;
    this.choiceSelectPrompt = choiceSelectPrompt || defaultChoiceSelectPrompt;
    this.choiceBatchSize = choiceBatchSize;
    this.formatNodeBatchFn = formatNodeBatchFn || defaultFormatNodeBatchFn;
    this.parseChoiceSelectAnswerFn =
      parseChoiceSelectAnswerFn || defaultParseChoiceSelectAnswerFn;
    this.serviceContext = serviceContext || index.serviceContext;
  }

  async aretrieve(query: string): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const results: NodeWithScore[] = [];

    for (let idx = 0; idx < nodeIds.length; idx += this.choiceBatchSize) {
      const nodeIdsBatch = nodeIds.slice(idx, idx + this.choiceBatchSize);
      const nodesBatch = await this.index.docStore.getNodes(nodeIdsBatch);

      const fmtBatchStr = this.formatNodeBatchFn(nodesBatch);
      const input = { context: fmtBatchStr, query: query };
      const rawResponse = await this.serviceContext.llmPredictor.apredict(
        this.choiceSelectPrompt,
        input
      );

      const [rawChoices, relevances] = this.parseChoiceSelectAnswerFn(
        rawResponse,
        nodesBatch.length
      );
      const choiceIndexes = rawChoices.map(
        (choice: string) => parseInt(choice) - 1
      );
      const choiceNodeIds = choiceIndexes.map(
        (idx: number) => nodeIdsBatch[idx]
      );

      const choiceNodes = await this.index.docStore.getNodes(choiceNodeIds);
      const relevancesFilled =
        relevances || new Array(choiceNodes.length).fill(1.0);
      const nodeWithScores = choiceNodes.map((node, i) => ({
        node: node,
        score: relevancesFilled[i],
      }));

      results.push(...nodeWithScores);
    }
    return results;
  }
}
