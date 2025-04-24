import type {
  FeatureExtractionPipeline,
  pipeline,
} from "@huggingface/transformers";
import { BaseEmbedding } from "@llamaindex/core/embeddings";
import { Settings } from "@llamaindex/core/global";
import {
  type LoadTransformerEvent,
  loadTransformers,
} from "@llamaindex/env/multi-model";
import { HuggingFaceEmbeddingModelType } from "./shared";

declare module "@llamaindex/core/global" {
  interface LlamaIndexEventMaps {
    "load-transformers": LoadTransformerEvent;
  }
}

export type HuggingFaceEmbeddingParams = {
  modelType?: string;
  modelOptions?: Parameters<typeof pipeline<"feature-extraction">>[2];
};

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
  modelOptions: Parameters<typeof pipeline<"feature-extraction">>[2] = {};

  private extractor: FeatureExtractionPipeline | null = null;

  constructor(params: HuggingFaceEmbeddingParams = {}) {
    super();
    if (params.modelType) {
      this.modelType = params.modelType;
    }
    if (params.modelOptions) {
      this.modelOptions = params.modelOptions;
    }
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
      this.extractor = (await pipeline(
        "feature-extraction",
        this.modelType,
        this.modelOptions,
      )) as never;
    }
    return this.extractor;
  }

  override async getTextEmbedding(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}
