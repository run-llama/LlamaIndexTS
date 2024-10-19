import { HfInference } from "@huggingface/inference";
import { BaseEmbedding } from "@llamaindex/core/embeddings";

export enum HuggingFaceEmbeddingModelType {
  XENOVA_ALL_MINILM_L6_V2 = "Xenova/all-MiniLM-L6-v2",
  XENOVA_ALL_MPNET_BASE_V2 = "Xenova/all-mpnet-base-v2",
}

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

  getTextEmbeddings = async (texts: string[]): Promise<Array<number[]>> => {
    const res = await this.hf.featureExtraction({
      model: this.model,
      inputs: texts,
    });
    return res as number[][];
  };
}

type HfInferenceOptions = ConstructorParameters<typeof HfInference>[1];

export type HFConfig = HfInferenceOptions & {
  model: string;
  accessToken: string;
  endpoint?: string;
};
