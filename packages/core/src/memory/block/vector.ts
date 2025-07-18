import type { BaseEmbedding } from "../../embeddings";
import { Settings } from "../../global";
import type { BaseNodePostprocessor } from "../../postprocessor";
import { BasePromptTemplate, PromptTemplate } from "../../prompts";
import type { NodeWithScore } from "../../schema";
import { MetadataMode, TextNode } from "../../schema";
import type {
  BaseVectorStore,
  MetadataFilter,
  VectorStoreQuery,
} from "../../vector-store";
import { VectorStoreQueryMode } from "../../vector-store";
import type { MemoryMessage } from "../types";
import { BaseMemoryBlock, type MemoryBlockOptions } from "./base";

/**
 * The options for the vector memory block.
 */
export type VectorMemoryBlockOptions = {
  /**
   * The vector store to use for retrieval.
   */
  vectorStore: BaseVectorStore;

  /**
   * The embedding model to use for encoding queries and documents.
   * @default embedModel from Settings
   */
  embedModel?: BaseEmbedding;

  /**
   * Maximum number of messages to include for context when retrieving.
   * @default 5
   */
  retrievalContextWindow?: number;

  /**
   * Template for formatting the retrieved information.
   * @default new PromptTemplate({ template: "{{ text }}" })
   */
  formatTemplate?: BasePromptTemplate;

  /**
   * List of node postprocessors to apply to the retrieved nodes containing messages.
   *
   * @default []
   */
  nodePostprocessors?: BaseNodePostprocessor[];

  /**
   * Configuration options for vector store queries when retrieving memory.
   *
   * @default
   * ```typescript
   * {
   *   similarityTopK: 2,                    // Number of top similar results to return
   *   mode: VectorStoreQueryMode.DEFAULT,   // Query mode for the vector store
   *   sessionFilterKey: "session_id",       // Metadata key for session filtering
   *   filters: {
   *     filters: [
   *       { key: "session_id", value: "<current block id>", operator: "==" }
   *     ],
   *     condition: "and"
   *   }
   * }
   * ```
   *
   * Note: A session filter is automatically added to ensure memory isolation between blocks.
   * If custom filters are provided, the session filter will be merged with them.
   */
  queryOptions?: Partial<VectorMemoryBlockQueryOptions>;
} & MemoryBlockOptions;

export type VectorMemoryBlockQueryOptions = Omit<
  VectorStoreQuery,
  "queryEmbedding" | "queryStr"
> & {
  sessionFilterKey: string;
};

/**
 * A memory block that retrieves relevant information from a vector store.
 *
 * This block stores conversation history in a vector store and retrieves
 * relevant information based on the most recent messages.
 */
export class VectorMemoryBlock<
  TAdditionalMessageOptions extends object = object,
> extends BaseMemoryBlock<TAdditionalMessageOptions> {
  private readonly vectorStore: BaseVectorStore;
  private readonly embedModel: BaseEmbedding;
  private readonly retrievalContextWindow: number;
  private readonly formatTemplate: BasePromptTemplate;
  private readonly nodePostprocessors: BaseNodePostprocessor[];
  private readonly queryOptions: VectorMemoryBlockQueryOptions;

  constructor(options: VectorMemoryBlockOptions) {
    super(options);

    // Validate vector store
    if (!options.vectorStore.storesText) {
      throw new Error(
        "vectorStore must store text to be used as a retrieval memory block",
      );
    }

    this.vectorStore = options.vectorStore;
    this.embedModel = options.embedModel ?? Settings.embedModel;
    this.retrievalContextWindow = options.retrievalContextWindow ?? 5;

    this.queryOptions = this.buildDefaultQueryOptions(options.queryOptions);

    this.formatTemplate =
      options.formatTemplate ?? new PromptTemplate({ template: "{{ text }}" });
    this.nodePostprocessors = options.nodePostprocessors ?? [];
  }

  async get(
    messages: MemoryMessage<TAdditionalMessageOptions>[] = [],
  ): Promise<MemoryMessage<TAdditionalMessageOptions>[]> {
    if (messages?.length === 0) return [];

    // Use the last message or a context window of messages for the query
    let context: MemoryMessage<TAdditionalMessageOptions>[];
    if (
      this.retrievalContextWindow > 1 &&
      messages.length >= this.retrievalContextWindow
    ) {
      context = messages.slice(-this.retrievalContextWindow);
    } else {
      context = messages;
    }
    const queryText = this.getTextFromMessages(context);
    if (!queryText) return [];

    // Create and execute the query
    const queryEmbedding = await this.embedModel.getTextEmbedding(queryText);
    const query: VectorStoreQuery = {
      queryStr: queryText,
      queryEmbedding,
      ...this.queryOptions,
    };
    const results = await this.vectorStore.query(query);
    if (!results.nodes?.length) return [];

    // Create nodes with scores
    const nodesWithScores: NodeWithScore[] = results.nodes.map(
      (node, index) => ({
        node,
        score: results.similarities?.[index] ?? undefined,
      }),
    );

    // Apply postprocessors
    let processedNodes = nodesWithScores;
    for (const postprocessor of this.nodePostprocessors) {
      processedNodes = await postprocessor.postprocessNodes(
        processedNodes,
        queryText,
      );
    }

    // Format the results
    const retrievedText = processedNodes
      .map(({ node }) => node.getContent(MetadataMode.NONE))
      .join("\n\n");

    const formattedText = this.formatTemplate.format({ text: retrievedText });

    // Return as memory message
    return [
      {
        id: this.id,
        role: "memory",
        content: formattedText,
      } as MemoryMessage<TAdditionalMessageOptions>,
    ];
  }

  async put(
    messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<void> {
    if (messages.length === 0) return;

    // Format messages with role, text content, and additional info
    const texts: string[] = [];

    for (const message of messages) {
      const text = this.getTextFromMessages([message]);
      if (!text) continue;

      let messageText = text;

      // Add additional info if present
      const additionalInfo = (message.options ?? {}) as Record<string, unknown>;
      if (Object.keys(additionalInfo).length > 0) {
        messageText += `\nAdditional Info: (${JSON.stringify(additionalInfo)})`;
      }

      texts.push(`<message role='${message.role}'>${messageText}</message>`);
    }

    if (texts.length === 0) return;

    // Create text node with session metadata
    const textNode = new TextNode({
      text: texts.join("\n"),
      metadata: { [this.queryOptions.sessionFilterKey]: this.id },
    });

    // Get embedding for the text
    textNode.embedding = await this.embedModel.getTextEmbedding(textNode.text);

    // Add to vector store
    await this.vectorStore.add([textNode]);
  }

  /**
   * Get text from messages.
   */
  private getTextFromMessages(
    messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): string {
    let text = "";
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]!;
      if (typeof message.content === "string") {
        text += message.content;
      } else if (Array.isArray(message.content)) {
        // Handle array content (e.g., text blocks)
        for (const block of message.content) {
          if (typeof block === "string") {
            text += block;
          } else if (block && typeof block === "object" && "text" in block) {
            text += (block as Record<string, unknown>).text as string;
          }
        }
      }

      if (messages.length > 1 && i !== messages.length - 1) {
        text += " ";
      }
    }
    return text;
  }

  private buildDefaultQueryOptions(
    options: Partial<VectorMemoryBlockQueryOptions> | undefined,
  ): VectorMemoryBlockQueryOptions {
    const {
      similarityTopK = 2,
      mode = VectorStoreQueryMode.DEFAULT,
      sessionFilterKey = "session_id",
    } = options ?? {};

    let filters = options?.filters;

    const sessionFilter: MetadataFilter = {
      key: sessionFilterKey,
      value: this.id,
      operator: "==",
    };

    if (filters) {
      // Only add session_id filter if it doesn't exist in the filters list
      const sessionIdFilterExists = filters.filters.some(
        (filter) => filter.key === sessionFilterKey,
      );
      if (!sessionIdFilterExists) {
        filters.filters.push(sessionFilter);
      }
    } else {
      // If no filters are provided, add the session_id filter
      filters = {
        filters: [sessionFilter],
        condition: "and",
      };
    }

    return { ...options, similarityTopK, mode, sessionFilterKey, filters };
  }
}
