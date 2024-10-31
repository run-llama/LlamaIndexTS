import { BaseEmbedding } from "@llamaindex/core/embeddings";
import { Settings } from "@llamaindex/core/global";
import { type LoadTransformerEvent, loadTransformers } from "@llamaindex/env";
import type { pipeline } from "@xenova/transformers";
import { HuggingFaceEmbeddingModelType } from "./shared";

declare module "@llamaindex/core/global" {
  interface LlamaIndexEventMaps {
    "load-transformers": LoadTransformerEvent;
  }
}

/**
 * Uses feature extraction from '@xenova/transformers' to generate embeddings.
 * Per default the model [XENOVA_ALL_MINILM_L6_V2](https://huggingface.co/Xenova/all-MiniLM-L6-v2) is used.
 *
 * Can be changed by setting the `modelType` parameter in the constructor, e.g.:
 * ```
 * new HuggingFaceEmbedding({
 *     modelType: HuggingFaceEmbeddingModelType.XENOVA_ALL_MPNET_BASE_V2,
 * });
 * ```
 *
 * @extends BaseEmbedding
 */
export class HuggingFaceEmbedding extends BaseEmbedding {
  modelType: string = HuggingFaceEmbeddingModelType.XENOVA_ALL_MINILM_L6_V2;
  quantized: boolean = true;

  private extractor: Awaited<
    ReturnType<typeof pipeline<"feature-extraction">>
  > | null = null;

  constructor(init?: Partial<HuggingFaceEmbedding>) {
    super();
    Object.assign(this, init);
  }

  async getExtractor() {
    if (!this.extractor) {
      const { pipeline } = await loadTransformers((transformer) => {
        Settings.callbackManager.dispatchEvent(
          "load-transformers",
          {
            transformer,
          },
          true,
        );
      });
      this.extractor = await pipeline("feature-extraction", this.modelType, {
        quantized: this.quantized,
      });
    }
    return this.extractor;
  }

  override async getTextEmbedding(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}
