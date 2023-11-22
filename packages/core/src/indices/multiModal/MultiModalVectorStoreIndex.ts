import _ from "lodash";
import { BaseNode, ImageNode, MetadataMode, TextNode } from "../../Node";
import { ClipEmbedding, MultiModalEmbedding } from "../../embeddings";
import { SimpleVectorStore, VectorStore } from "../../storage";
import { VectorStoreIndex } from "../vectorStore";
import { VectorIndexConstructorProps } from "../vectorStore/VectorStoreIndex";

export class MultiModalVectorStoreIndex extends VectorStoreIndex {
  imageVectorStore: VectorStore;
  imageEmbedModel: MultiModalEmbedding;

  protected constructor(init: VectorIndexConstructorProps) {
    super(init);
    // TODO: get image vector store from storage context
    this.imageVectorStore = new SimpleVectorStore();
    this.imageEmbedModel = new ClipEmbedding();
  }

  /**
   * Get the embeddings for image nodes.
   * @param nodes
   * @param serviceContext
   * @param logProgress log progress to console (useful for debugging)
   * @returns
   */
  async getImageNodeEmbeddingResults(
    nodes: ImageNode[],
    logProgress: boolean = false,
  ) {
    const isImageToText = nodes.every((node) => _.isString(node.text));
    if (isImageToText) {
      // every image node has a text, use the text embedding model
      return this.getNodeEmbeddingResults(nodes, logProgress);
    }

    const nodesWithEmbeddings: ImageNode[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (logProgress) {
        console.log(`getting embedding for node ${i}/${nodes.length}`);
      }
      node.embedding = await this.imageEmbedModel.getImageEmbedding(
        node.getContent(MetadataMode.EMBED),
      );
      nodesWithEmbeddings.push(node);
    }

    return nodesWithEmbeddings;
  }

  private splitNodes(nodes: BaseNode[]): {
    imageNodes: ImageNode[];
    textNodes: TextNode[];
  } {
    let imageNodes: ImageNode[] = [];
    let textNodes: TextNode[] = [];

    for (let node of nodes) {
      if (node instanceof ImageNode) {
        imageNodes.push(node);
      }
      if (node instanceof TextNode) {
        textNodes.push(node);
      }
    }
    return {
      imageNodes,
      textNodes,
    };
  }

  async insertNodes(nodes: BaseNode[]): Promise<void> {
    if (!nodes || nodes.length === 0) {
      return;
    }
    const { imageNodes, textNodes } = this.splitNodes(nodes);

    super.insertNodes(textNodes);

    const imageNodesWithEmbedding =
      await this.getImageNodeEmbeddingResults(imageNodes);
    super.insertNodesToStore(this.imageVectorStore, imageNodesWithEmbedding);
  }

  async deleteRefDoc(
    refDocId: string,
    deleteFromDocStore: boolean = true,
  ): Promise<void> {
    await this.deleteRefDocFromStore(this.imageVectorStore, refDocId);
    await super.deleteRefDoc(refDocId, deleteFromDocStore);
  }
}
