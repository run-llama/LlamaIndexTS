import { getEnv } from "@llamaindex/env";
import { MixedbreadAI, MixedbreadAIClient } from "@mixedbread-ai/sdk";

import type { NodeWithScore } from "../../Node.js";
import { BaseNode, MetadataMode } from "../../Node.js";
import type { MessageContent } from "../../llm/types.js";
import { extractText } from "../../llm/utils.js";
import type { BaseNodePostprocessor } from "../types.js";

type RerankingRequestWithoutInput = Omit<
  MixedbreadAI.RerankingRequest,
  "query" | "input"
>;

/**
 * Interface extending RerankingRequestWithoutInput with additional
 * parameters specific to the MixedbreadRerank class.
 */
export interface MixedbreadAIRerankerParams
  extends Omit<RerankingRequestWithoutInput, "model"> {
  /**
   * The model to use for reranking. For example "default" or "mixedbread-ai/mxbai-rerank-large-v1".
   * @default {"default"}
   */
  model?: string;

  /**
   * The API key to use.
   * @default {process.env.MXBAI_API_KEY}
   */
  apiKey?: string;

  /**
   * The base URL of the MixedbreadAI API.
   */
  baseUrl?: string;

  /**
   * The maximum number of retries to attempt.
   * @default {3}
   */
  maxRetries?: number;

  /**
   * Timeouts for the request.
   */
  timeoutInSeconds?: number;
}

/**
 * Node postprocessor that uses MixedbreadAI's rerank API.
 *
 * This class utilizes MixedbreadAI's rerank model to reorder a set of nodes based on their relevance
 * to a given query. The reranked nodes are then used for various applications like search results refinement.
 *
 * @example
 * const reranker = new MixedbreadAIReranker({ apiKey: 'your-api-key' });
 * const nodes = [{ node: new BaseNode('To bake bread you need flour') }, { node: new BaseNode('To bake bread you need yeast') }];
 * const query = "What do you need to bake bread?";
 * const result = await reranker.postprocessNodes(nodes, query);
 * console.log(result);
 *
 * @example
 * const reranker = new MixedbreadAIReranker({
 *   apiKey: 'your-api-key',
 *   model: 'mixedbread-ai/mxbai-rerank-large-v1',
 *   topK: 5,
 *   rankFields: ["title", "content"],
 *   returnInput: true,
 *   maxRetries: 5
 * });
 * const documents = [{ title: "Bread Recipe", content: "To bake bread you need flour" }, { title: "Bread Recipe", content: "To bake bread you need yeast" }];
 * const query = "What do you need to bake bread?";
 * const result = await reranker.rerank(documents, query);
 * console.log(result);
 */
export class MixedbreadAIReranker implements BaseNodePostprocessor {
  requestParams: RerankingRequestWithoutInput;
  requestOptions: MixedbreadAIClient.RequestOptions;

  private readonly client: MixedbreadAIClient;

  /**
   * Constructor for MixedbreadRerank.
   * @param {Partial<MixedbreadAIRerankerParams>} params - An optional object with properties to configure the instance.
   * @throws {Error} If the API key is not provided or found in the environment variables.
   */
  constructor(params: Partial<MixedbreadAIRerankerParams>) {
    const apiKey = params?.apiKey ?? getEnv("MXBAI_API_KEY");
    if (!apiKey) {
      throw new Error(
        "MixedbreadAI API key not found. Either provide it in the constructor or set the 'MXBAI_API_KEY' environment variable.",
      );
    }

    this.requestOptions = {
      maxRetries: params?.maxRetries ?? 3,
      timeoutInSeconds: params?.timeoutInSeconds,
      // Support for this already exists in the python sdk and will be added to the js sdk soon
      // @ts-ignore
      additionalHeaders: {
        "user-agent": "@mixedbread-ai/llamaindex-ts-sdk",
      },
    };
    this.client = new MixedbreadAIClient({
      apiKey: apiKey,
      environment: params?.baseUrl,
    });
    this.requestParams = {
      model: params?.model ?? "default",
      returnInput: params?.returnInput ?? false,
      topK: params?.topK,
      rankFields: params?.rankFields,
    };
  }

  /**
   * Reranks the nodes using the mixedbread.ai API.
   * @param {NodeWithScore[]} nodes - Array of nodes with scores.
   * @param {MessageContent} [query] - Query string.
   * @throws {Error} If query is undefined.
   *
   * @returns {Promise<NodeWithScore[]>} A Promise that resolves to an ordered list of nodes with relevance scores.
   *
   * @example
   * const nodes = [{ node: new BaseNode('To bake bread you need flour') }, { node: new BaseNode('To bake bread you need yeast') }];
   * const query = "What do you need to bake bread?";
   * const result = await reranker.postprocessNodes(nodes, query);
   * console.log(result);
   */
  async postprocessNodes(
    nodes: NodeWithScore[],
    query?: MessageContent,
  ): Promise<NodeWithScore[]> {
    if (query === undefined) {
      throw new Error("MixedbreadAIReranker requires a query");
    }
    if (nodes.length === 0) {
      return [];
    }

    const input = nodes.map((n) => n.node.getContent(MetadataMode.ALL));
    const result = await this.client.reranking(
      {
        query: extractText(query),
        input,
        ...this.requestParams,
      },
      this.requestOptions,
    );

    const newNodes: NodeWithScore[] = [];
    for (const document of result.data) {
      const node = nodes[document.index];
      node.score = document.score;
      newNodes.push(node);
    }

    return newNodes;
  }

  /**
   * Returns an ordered list of documents sorted by their relevance to the provided query.
   * @param {(Array<string> | Array<BaseNode> | Array<Record<string, unknown>>)} nodes - A list of documents as strings, DocumentInterfaces, or objects with a `pageContent` key.
   * @param {string} query - The query to use for reranking the documents.
   * @param {RerankingRequestWithoutInput} [options] - Optional parameters for reranking.
   *
   * @returns {Promise<Array<MixedbreadAI.RankedDocument>>} A Promise that resolves to an ordered list of documents with relevance scores.
   *
   * @example
   * const nodes = ["To bake bread you need flour", "To bake bread you need yeast"];
   * const query = "What do you need to bake bread?";
   * const result = await reranker.rerank(nodes, query);
   * console.log(result);
   */
  async rerank(
    nodes: Array<string> | Array<BaseNode> | Array<Record<string, unknown>>,
    query: string,
    options?: RerankingRequestWithoutInput,
  ): Promise<Array<MixedbreadAI.RankedDocument>> {
    if (nodes.length === 0) {
      return [];
    }

    const input =
      typeof nodes[0] === "object" && "node" in nodes[0]
        ? (nodes as BaseNode[]).map((n) => n.getContent(MetadataMode.ALL))
        : (nodes as string[]);

    const result = await this.client.reranking(
      {
        query,
        input,
        ...this.requestParams,
        ...options,
      },
      this.requestOptions,
    );

    return result.data;
  }
}
