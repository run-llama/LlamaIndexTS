import { BaseNode, MetadataMode, TextNode } from "../Node";
import { LLM } from "../llm";
import { BaseExtractor } from "./types";

const defaultKeywordExtractorPromptTemplate = ({
  context_str,
  keywords,
}: {
  context_str: string;
  keywords: number;
}) => `
  /${context_str}. Give ${keywords} unique keywords for this \
  document. Format as comma separated. Keywords:
`;

const defaultTitleExtractorPromptTemplate = ({
  context_str,
}: {
  context_str: string;
}) => `
  /${context_str}. Give a title that summarizes all of the unique entities, titles or themes found in the context. Title:
`;

const defaultTitleCombinePromptTemplate = ({
  context_str,
}: {
  context_str: string;
}) => `
  /${context_str}. Based on the above candidate titles and content, \
  what is the comprehensive title for this document? Title:
`;

/**
 * Extract keywords from a list of nodes.
 */
export class KeywordExtractor extends BaseExtractor {
  llm: LLM;
  keywords: number = 5;

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
      document_title: title.trim().replace(/(\r\n|\n|\r)/gm, ""),
    }));
  }
}
