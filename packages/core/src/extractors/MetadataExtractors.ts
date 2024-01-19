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

export class KeywordExtractor extends BaseExtractor {
  llm: LLM;
  keywords: number = 5;

  constructor(llm: LLM, keywords: number = 5) {
    if (keywords < 1) throw new Error("Keywords must be greater than 0");

    super();
    this.llm = llm;
    this.keywords = keywords;
  }

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

  async extract(nodes: BaseNode[]): Promise<Record<string, any>[]> {
    const results = await Promise.all(
      nodes.map((node) => this.extractKeywordsFromNodes(node)),
    );
    return results;
  }
}
