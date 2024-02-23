import { BaseNode, MetadataMode, TextNode } from "../Node";
import { LLM, OpenAI } from "../llm";
import {
  defaultKeywordExtractorPromptTemplate,
  defaultQuestionAnswerPromptTemplate,
  defaultSummaryExtractorPromptTemplate,
  defaultTitleCombinePromptTemplate,
  defaultTitleExtractorPromptTemplate,
} from "./prompts";
import { BaseExtractor } from "./types";

const STRIP_REGEX = /(\r\n|\n|\r)/gm;

type KeywordExtractArgs = {
  llm?: LLM;
  keywords?: number;
};

type ExtractKeyword = {
  excerptKeywords: string;
};

/**
 * Extract keywords from a list of nodes.
 */
export class KeywordExtractor extends BaseExtractor {
  /**
   * LLM instance.
   * @type {LLM}
   */
  llm: LLM;

  /**
   * Number of keywords to extract.
   * @type {number}
   * @default 5
   */
  keywords: number = 5;

  /**
   * Constructor for the KeywordExtractor class.
   * @param {LLM} llm LLM instance.
   * @param {number} keywords Number of keywords to extract.
   * @throws {Error} If keywords is less than 1.
   */
  constructor(options?: KeywordExtractArgs) {
    if (options?.keywords && options.keywords < 1)
      throw new Error("Keywords must be greater than 0");

    super();

    this.llm = options?.llm ?? new OpenAI();
    this.keywords = options?.keywords ?? 5;
  }

  /**
   *
   * @param node Node to extract keywords from.
   * @returns Keywords extracted from the node.
   */
  async extractKeywordsFromNodes(node: BaseNode): Promise<ExtractKeyword | {}> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return {};
    }

    const completion = await this.llm.complete({
      prompt: defaultKeywordExtractorPromptTemplate({
        contextStr: node.getContent(MetadataMode.ALL),
        keywords: this.keywords,
      }),
    });

    return {
      excerptKeywords: completion.text,
    };
  }

  /**
   *
   * @param nodes Nodes to extract keywords from.
   * @returns Keywords extracted from the nodes.
   */
  async extract(nodes: BaseNode[]): Promise<Array<ExtractKeyword> | Array<{}>> {
    const results = await Promise.all(
      nodes.map((node) => this.extractKeywordsFromNodes(node)),
    );
    return results;
  }
}

type TitleExtractorsArgs = {
  llm?: LLM;
  nodes?: number;
  nodeTemplate?: string;
  combineTemplate?: string;
};

type ExtractTitle = {
  documentTitle: string;
};

/**
 * Extract title from a list of nodes.
 */
export class TitleExtractor extends BaseExtractor {
  /**
   * LLM instance.
   * @type {LLM}
   */
  llm: LLM;

  /**
   * Can work for mixture of text and non-text nodes
   * @type {boolean}
   * @default false
   */
  isTextNodeOnly: boolean = false;

  /**
   * Number of nodes to extrct titles from.
   * @type {number}
   * @default 5
   */
  nodes: number = 5;

  /**
   * The prompt template to use for the title extractor.
   * @type {string}
   */
  nodeTemplate: string;

  /**
   * The prompt template to merge title with..
   * @type {string}
   */
  combineTemplate: string;

  /**
   * Constructor for the TitleExtractor class.
   * @param {LLM} llm LLM instance.
   * @param {number} nodes Number of nodes to extract titles from.
   * @param {string} node_template The prompt template to use for the title extractor.
   * @param {string} combine_template The prompt template to merge title with..
   */
  constructor(options?: TitleExtractorsArgs) {
    super();

    this.llm = options?.llm ?? new OpenAI();
    this.nodes = options?.nodes ?? 5;

    this.nodeTemplate =
      options?.nodeTemplate ?? defaultTitleExtractorPromptTemplate();
    this.combineTemplate =
      options?.combineTemplate ?? defaultTitleCombinePromptTemplate();
  }

  /**
   * Extract titles from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract titles from.
   * @returns {Promise<BaseNode<ExtractTitle>[]>} Titles extracted from the nodes.
   */
  async extract(nodes: BaseNode[]): Promise<Array<ExtractTitle>> {
    const nodesToExtractTitle: BaseNode[] = [];

    for (let i = 0; i < this.nodes; i++) {
      if (nodesToExtractTitle.length >= nodes.length) break;

      if (this.isTextNodeOnly && !(nodes[i] instanceof TextNode)) continue;

      nodesToExtractTitle.push(nodes[i]);
    }

    if (nodesToExtractTitle.length === 0) return [];

    const titlesCandidates: string[] = [];
    let title: string = "";

    for (let i = 0; i < nodesToExtractTitle.length; i++) {
      const completion = await this.llm.complete({
        prompt: defaultTitleExtractorPromptTemplate({
          contextStr: nodesToExtractTitle[i].getContent(MetadataMode.ALL),
        }),
      });

      titlesCandidates.push(completion.text);
    }

    if (nodesToExtractTitle.length > 1) {
      const combinedTitles = titlesCandidates.join(",");

      const completion = await this.llm.complete({
        prompt: defaultTitleCombinePromptTemplate({
          contextStr: combinedTitles,
        }),
      });

      title = completion.text;
    }

    if (nodesToExtractTitle.length === 1) {
      title = titlesCandidates[0];
    }

    return nodes.map((_) => ({
      documentTitle: title.trim().replace(STRIP_REGEX, ""),
    }));
  }
}

type QuestionAnswerExtractArgs = {
  llm?: LLM;
  questions?: number;
  promptTemplate?: string;
  embeddingOnly?: boolean;
};

type ExtractQuestion = {
  questionsThisExcerptCanAnswer: string;
};

/**
 * Extract questions from a list of nodes.
 */
export class QuestionsAnsweredExtractor extends BaseExtractor {
  /**
   * LLM instance.
   * @type {LLM}
   */
  llm: LLM;

  /**
   * Number of questions to generate.
   * @type {number}
   * @default 5
   */
  questions: number = 5;

  /**
   * The prompt template to use for the question extractor.
   * @type {string}
   */
  promptTemplate: string;

  /**
   * Wheter to use metadata for embeddings only
   * @type {boolean}
   * @default false
   */
  embeddingOnly: boolean = false;

  /**
   * Constructor for the QuestionsAnsweredExtractor class.
   * @param {LLM} llm LLM instance.
   * @param {number} questions Number of questions to generate.
   * @param {string} promptTemplate The prompt template to use for the question extractor.
   * @param {boolean} embeddingOnly Wheter to use metadata for embeddings only.
   */
  constructor(options?: QuestionAnswerExtractArgs) {
    if (options?.questions && options.questions < 1)
      throw new Error("Questions must be greater than 0");

    super();

    this.llm = options?.llm ?? new OpenAI();
    this.questions = options?.questions ?? 5;
    this.promptTemplate =
      options?.promptTemplate ??
      defaultQuestionAnswerPromptTemplate({
        numQuestions: this.questions,
        contextStr: "",
      });
    this.embeddingOnly = options?.embeddingOnly ?? false;
  }

  /**
   * Extract answered questions from a node.
   * @param {BaseNode} node Node to extract questions from.
   * @returns {Promise<Array<ExtractQuestion> | Array<{}>>} Questions extracted from the node.
   */
  async extractQuestionsFromNode(
    node: BaseNode,
  ): Promise<ExtractQuestion | {}> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return {};
    }

    const contextStr = node.getContent(this.metadataMode);

    const prompt = defaultQuestionAnswerPromptTemplate({
      contextStr,
      numQuestions: this.questions,
    });

    const questions = await this.llm.complete({
      prompt,
    });

    return {
      questionsThisExcerptCanAnswer: questions.text.replace(STRIP_REGEX, ""),
    };
  }

  /**
   * Extract answered questions from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract questions from.
   * @returns {Promise<Array<ExtractQuestion> | Array<{}>>} Questions extracted from the nodes.
   */
  async extract(
    nodes: BaseNode[],
  ): Promise<Array<ExtractQuestion> | Array<{}>> {
    const results = await Promise.all(
      nodes.map((node) => this.extractQuestionsFromNode(node)),
    );

    return results;
  }
}

type SummaryExtractArgs = {
  llm?: LLM;
  summaries?: string[];
  promptTemplate?: string;
};

type ExtractSummary = {
  sectionSummary: string;
  prevSectionSummary: string;
  nextSectionSummary: string;
};

/**
 * Extract summary from a list of nodes.
 */
export class SummaryExtractor extends BaseExtractor {
  /**
   * LLM instance.
   * @type {LLM}
   */
  llm: LLM;

  /**
   * List of summaries to extract: 'self', 'prev', 'next'
   * @type {string[]}
   */
  summaries: string[];

  /**
   * The prompt template to use for the summary extractor.
   * @type {string}
   */
  promptTemplate: string;

  private _selfSummary: boolean;
  private _prevSummary: boolean;
  private _nextSummary: boolean;

  constructor(options?: SummaryExtractArgs) {
    const summaries = options?.summaries ?? ["self"];

    if (
      summaries &&
      !summaries.some((s) => ["self", "prev", "next"].includes(s))
    )
      throw new Error("Summaries must be one of 'self', 'prev', 'next'");

    super();

    this.llm = options?.llm ?? new OpenAI();
    this.summaries = summaries;
    this.promptTemplate =
      options?.promptTemplate ?? defaultSummaryExtractorPromptTemplate();

    this._selfSummary = summaries?.includes("self") ?? false;
    this._prevSummary = summaries?.includes("prev") ?? false;
    this._nextSummary = summaries?.includes("next") ?? false;
  }

  /**
   * Extract summary from a node.
   * @param {BaseNode} node Node to extract summary from.
   * @returns {Promise<string>} Summary extracted from the node.
   */
  async generateNodeSummary(node: BaseNode): Promise<string> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return "";
    }

    const contextStr = node.getContent(this.metadataMode);

    const prompt = defaultSummaryExtractorPromptTemplate({
      contextStr,
    });

    const summary = await this.llm.complete({
      prompt,
    });

    return summary.text.replace(STRIP_REGEX, "");
  }

  /**
   * Extract summaries from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract summaries from.
   * @returns {Promise<Array<ExtractSummary> | Arry<{}>>} Summaries extracted from the nodes.
   */
  async extract(nodes: BaseNode[]): Promise<Array<ExtractSummary> | Array<{}>> {
    if (!nodes.every((n) => n instanceof TextNode))
      throw new Error("Only `TextNode` is allowed for `Summary` extractor");

    const nodeSummaries = await Promise.all(
      nodes.map((node) => this.generateNodeSummary(node)),
    );

    const metadataList: any[] = nodes.map(() => ({}));

    for (let i = 0; i < nodes.length; i++) {
      if (i > 0 && this._prevSummary && nodeSummaries[i - 1]) {
        metadataList[i]["prevSectionSummary"] = nodeSummaries[i - 1];
      }
      if (i < nodes.length - 1 && this._nextSummary && nodeSummaries[i + 1]) {
        metadataList[i]["nextSectionSummary"] = nodeSummaries[i + 1];
      }
      if (this._selfSummary && nodeSummaries[i]) {
        metadataList[i]["sectionSummary"] = nodeSummaries[i];
      }
    }

    return metadataList;
  }
}
