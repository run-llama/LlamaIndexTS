import { BaseNode, MetadataMode, TextNode } from "../Node";
import { LLM } from "../llm";
import {
  defaultKeywordExtractorPromptTemplate,
  defaultQuestionAnswerPromptTemplate,
  defaultSummaryExtractorPromptTemplate,
  defaultTitleCombinePromptTemplate,
  defaultTitleExtractorPromptTemplate,
} from "./prompts";
import { BaseExtractor } from "./types";

const STRIP_REGEX = /(\r\n|\n|\r)/gm;

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
  constructor(llm: LLM, keywords: number = 5) {
    if (keywords < 1) throw new Error("Keywords must be greater than 0");

    super();
    this.llm = llm;
    this.keywords = keywords;
  }

  /**
   *
   * @param node Node to extract keywords from.
   * @returns Keywords extracted from the node.
   */
  async extractKeywordsFromNodes(
    node: BaseNode,
  ): Promise<Record<string, string>> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return {};
    }

    const completion = await this.llm.complete({
      prompt: defaultKeywordExtractorPromptTemplate({
        context_str: node.getContent(MetadataMode.ALL),
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
  async extract(nodes: BaseNode[]): Promise<Record<string, any>[]> {
    const results = await Promise.all(
      nodes.map((node) => this.extractKeywordsFromNodes(node)),
    );
    return results;
  }
}

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
   * @default "{title}"
   */
  nodeTemplate: string = defaultTitleExtractorPromptTemplate({
    context_str: "{title}",
  });

  /**
   * The prompt template to merge title with..
   * @type {string}
   * @default "{title}"
   */
  combineTemplate: string = defaultTitleCombinePromptTemplate({
    context_str: "{title}",
  });

  /**
   * Constructor for the TitleExtractor class.
   * @param {LLM} llm LLM instance.
   * @param {number} nodes Number of nodes to extract titles from.
   * @param {string} node_template The prompt template to use for the title extractor.
   * @param {string} combine_template The prompt template to merge title with..
   */
  constructor(
    llm: LLM,
    nodes: number = 5,
    node_template: string = defaultTitleExtractorPromptTemplate({
      context_str: "{title}",
    }),
    combine_template: string = defaultTitleCombinePromptTemplate({
      context_str: "{title}",
    }),
  ) {
    super();

    this.llm = llm;
    this.nodes = nodes;
    this.nodeTemplate = node_template;
    this.combineTemplate = combine_template;
  }

  /**
   * Extract titles from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract titles from.
   * @returns {Promise<Record<string, any>[]>} Titles extracted from the nodes.
   */
  async extract(nodes: BaseNode[]): Promise<Record<string, any>[]> {
    const nodesToExtractTitle: BaseNode[] = [];

    for (let i = 0; i < this.nodes; i++) {
      if (nodesToExtractTitle.length >= nodes.length) break;

      if (this.isTextNodeOnly && !(nodes[i] instanceof TextNode)) continue;

      nodesToExtractTitle.push(nodes[i]);
    }

    if (nodesToExtractTitle.length === 0) return [];

    let titlesCandidates: string[] = [];
    let title: string = "";

    for (let i = 0; i < nodesToExtractTitle.length; i++) {
      const completion = await this.llm.complete({
        prompt: defaultTitleExtractorPromptTemplate({
          context_str: nodesToExtractTitle[i].getContent(MetadataMode.ALL),
        }),
      });

      titlesCandidates.push(completion.text);
    }

    if (nodesToExtractTitle.length > 1) {
      const combinedTitles = titlesCandidates.join(",");

      const completion = await this.llm.complete({
        prompt: defaultTitleCombinePromptTemplate({
          context_str: combinedTitles,
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
   * @default "{context}"
   */
  promptTemplate: string = defaultQuestionAnswerPromptTemplate({
    context_str: "{context}",
    num_questions: this.questions,
  });

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
  constructor(
    llm: LLM,
    questions: number = 5,
    promptTemplate: string = defaultQuestionAnswerPromptTemplate({
      context_str: "{context}",
      num_questions: questions,
    }),
    embeddingOnly: boolean = false,
  ) {
    if (questions < 1) throw new Error("Questions must be greater than 0");

    super();

    this.llm = llm;
    this.questions = questions;
    this.promptTemplate = promptTemplate;
    this.embeddingOnly = embeddingOnly;
  }

  /**
   * Extract answered questions from a node.
   * @param {BaseNode} node Node to extract questions from.
   * @returns {Promise<Record<string, any>>} Questions extracted from the node.
   */
  async extractQuestionsFromNode(
    node: BaseNode,
  ): Promise<Record<string, string>> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return {};
    }

    const context_str = node.getContent(this.metadataMode);

    const prompt = defaultQuestionAnswerPromptTemplate({
      context_str,
      num_questions: this.questions,
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
   * @returns {Promise<Record<string, any>[]>} Questions extracted from the nodes.
   */
  async extract(nodes: BaseNode[]): Promise<Record<string, any>[]> {
    const results = await Promise.all(
      nodes.map((node) => this.extractQuestionsFromNode(node)),
    );

    return results;
  }
}

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
   * @default "{context}"
   */
  promptTemplate: string = defaultSummaryExtractorPromptTemplate({
    context_str: "{context}",
  });

  private _selfSummary: boolean;
  private _prevSummary: boolean;
  private _nextSummary: boolean;

  constructor(
    llm: LLM,
    summaries: string[] = ["self"],
    promptTemplate: string = defaultSummaryExtractorPromptTemplate({
      context_str: "{context}",
    }),
  ) {
    if (!summaries.some((s) => ["self", "prev", "next"].includes(s)))
      throw new Error("Summaries must be one of 'self', 'prev', 'next'");

    super();

    this.llm = llm;
    this.summaries = summaries;
    this.promptTemplate = promptTemplate;

    this._selfSummary = summaries.includes("self");
    this._prevSummary = summaries.includes("prev");
    this._nextSummary = summaries.includes("next");
  }

  /**
   * Extract summary from a node.
   * @param {BaseNode} node Node to extract summary from.
   * @returns {Promise<Record<string, string>>} Summary extracted from the node.
   */
  async generateNodeSummary(node: BaseNode): Promise<string> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return "";
    }

    const context_str = node.getContent(this.metadataMode);

    const prompt = defaultSummaryExtractorPromptTemplate({
      context_str,
    });

    const summary = await this.llm.complete({
      prompt,
    });

    return summary.text.replace(STRIP_REGEX, "");
  }

  /**
   * Extract summaries from a list of nodes.
   * @param {BaseNode[]} nodes Nodes to extract summaries from.
   * @returns {Promise<Record<string, any>[]>} Summaries extracted from the nodes.
   */
  async extract(nodes: BaseNode[]): Promise<Record<string, any>[]> {
    if (!nodes.every((n) => n instanceof TextNode))
      throw new Error("Only `TextNode` is allowed for `Summary` extractor");

    const nodeSummaries = await Promise.all(
      nodes.map((node) => this.generateNodeSummary(node)),
    );

    let metadataList: any[] = nodes.map(() => ({}));

    for (let i = 0; i < nodes.length; i++) {
      if (i > 0 && this._prevSummary && nodeSummaries[i - 1]) {
        metadataList[i]["prev_section_summary"] = nodeSummaries[i - 1];
      }
      if (i < nodes.length - 1 && this._nextSummary && nodeSummaries[i + 1]) {
        metadataList[i]["next_section_summary"] = nodeSummaries[i + 1];
      }
      if (this._selfSummary && nodeSummaries[i]) {
        metadataList[i]["section_summary"] = nodeSummaries[i];
      }
    }

    return metadataList;
  }
}
