import { HfInference } from "@huggingface/inference";
import { lazyLoadTransformers } from "../internal/deps/transformers.js";
import { BaseEmbedding } from "./types.js";

export enum HuggingFaceEmbeddingModelType {
  XENOVA_ALL_MINILM_L6_V2 = "Xenova/all-MiniLM-L6-v2",
  XENOVA_ALL_MPNET_BASE_V2 = "Xenova/all-mpnet-base-v2",
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

  private extractor: any;

  constructor(init?: Partial<HuggingFaceEmbedding>) {
    super();
    Object.assign(this, init);
  }

  async getExtractor() {
    if (!this.extractor) {
      const { pipeline } = await lazyLoadTransformers();
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

// Workaround to get the Options type from @huggingface/inference@2.7.0
type HfInferenceOptions = ConstructorParameters<typeof HfInference>[1];

export type HFConfig = HfInferenceOptions & {
  model: string;
  accessToken: string;
  endpoint?: string;
};

/**
 * Uses feature extraction from Hugging Face's Inference API to generate embeddings.
 *
 * Set the `model` and `accessToken` parameter in the constructor, e.g.:
 * ```
 * new HuggingFaceInferenceAPIEmbedding({
 *     model: HuggingFaceEmbeddingModelType.XENOVA_ALL_MPNET_BASE_V2,
 *     accessToken: "<your-access-token>"
 * });
 * ```
 *
 * @extends BaseEmbedding
 */
export class HuggingFaceInferenceAPIEmbedding extends BaseEmbedding {
  model: string;
  hf: HfInference;

  constructor(init: HFConfig) {
    super();
    const { model, accessToken, endpoint, ...hfInferenceOpts } = init;

    this.hf = new HfInference(accessToken, hfInferenceOpts);
    this.model = model;
    if (endpoint) this.hf.endpoint(endpoint);
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const res = await this.hf.featureExtraction({
      model: this.model,
      inputs: text,
    });
    return res as number[];
  }

  async getTextEmbeddings(texts: string[]): Promise<Array<number[]>> {
    const res = await this.hf.featureExtraction({
      model: this.model,
      inputs: texts,
    });
    return res as number[][];
  }
}
