import type { BaseEmbedding } from "../../embeddings";
import { Settings } from "../../global";
import type { BaseNodePostprocessor } from "../../postprocessor";
import type { NodeWithScore } from "../../schema";
import { MetadataMode, TextNode } from "../../schema";
import type {
  BaseVectorStore,
  MetadataFilter,
  MetadataFilters,
  VectorStoreQuery,
} from "../../vector-store";
import { VectorStoreQueryMode } from "../../vector-store";
import type { MemoryMessage } from "../types";
import { BaseMemoryBlock, type MemoryBlockOptions } from "./base";

const DEFAULT_RETRIEVED_TEXT_TEMPLATE = "{{ text }}";

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
   */
  embedModel?: BaseEmbedding;
  /**
   * Number of top results to return.
   */
  similarityTopK?: number;
  /**
   * Maximum number of messages to include for context when retrieving.
   */
  retrievalContextWindow?: number;
  /**
   * Template for formatting the retrieved information.
   */
  formatTemplate?: string;
  /**
   * List of node postprocessors to apply to the retrieved nodes containing messages.
   */
  nodePostprocessors?: BaseNodePostprocessor[];
  /**
   * Additional keyword arguments for the vector store query.
   */
  queryKwargs?: Record<string, unknown>;
} & MemoryBlockOptions;

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
  private readonly similarityTopK: number;
  private readonly retrievalContextWindow: number;
  private readonly formatTemplate: string;
  private readonly nodePostprocessors: BaseNodePostprocessor[];
  private readonly queryKwargs: Record<string, unknown>;

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
    this.similarityTopK = options.similarityTopK ?? 2;
    this.retrievalContextWindow = options.retrievalContextWindow ?? 5;
    this.formatTemplate =
      options.formatTemplate ?? DEFAULT_RETRIEVED_TEXT_TEMPLATE;
    this.nodePostprocessors = options.nodePostprocessors ?? [];
    this.queryKwargs = options.queryKwargs ?? {};
  }

  async get(
    messages: MemoryMessage<TAdditionalMessageOptions>[],
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
    if (!queryText) {
      return [];
    }

    // Handle filtering by session_id
    let filters = this.queryKwargs.filters as MetadataFilters | undefined;
    const effectiveSessionId = this.id;
    const sessionFilter: MetadataFilter = {
      key: "session_id",
      value: effectiveSessionId,
      operator: "==",
    };

    if (filters) {
      // Only add session_id filter if it doesn't exist in the filters list
      const sessionIdFilterExists = filters.filters.some(
        (filter) => filter.key === "session_id",
      );
      if (!sessionIdFilterExists) {
        filters.filters.push(sessionFilter);
      }
    } else {
      filters = {
        filters: [sessionFilter],
        condition: "and",
      };
    }

    // Create and execute the query
    const queryEmbedding = await this.embedModel.getTextEmbedding(queryText);
    const query: VectorStoreQuery = {
      queryStr: queryText,
      queryEmbedding: queryEmbedding,
      similarityTopK: this.similarityTopK,
      mode: VectorStoreQueryMode.DEFAULT,
      filters: filters,
      ...this.queryKwargs,
    };

    const results = await this.vectorStore.query(query);

    if (!results.nodes || results.nodes.length === 0) {
      return [];
    }

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

    const formattedText = this.formatTemplate.replace(
      "{{ text }}",
      retrievedText,
    );

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
    if (messages.length === 0) {
      return;
    }

    // Format messages with role, text content, and additional info
    const texts: string[] = [];

    for (const message of messages) {
      const text = this.getTextFromMessages([message]);
      if (!text) {
        continue;
      }

      // Add additional info if present
      let messageText = text;
      const additionalInfo = { ...message };
      delete (additionalInfo as Record<string, unknown>).content;
      delete (additionalInfo as Record<string, unknown>).role;
      delete (additionalInfo as Record<string, unknown>).id;
      delete (additionalInfo as Record<string, unknown>).session_id;

      if (Object.keys(additionalInfo).length > 0) {
        messageText += `\nAdditional Info: (${JSON.stringify(additionalInfo)})`;
      }

      messageText = `<message role='${message.role}'>${messageText}</message>`;
      texts.push(messageText);
    }

    if (texts.length === 0) {
      return;
    }

    // Create text node with session metadata
    const textNode = new TextNode({
      text: texts.join("\n"),
      metadata: { session_id: this.id },
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
}
