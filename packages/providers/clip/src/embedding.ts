import { MultiModalEmbedding } from "@llamaindex/core/embeddings";
import type { ImageType } from "@llamaindex/core/schema";
// only import type, to avoid bundling error
import { Settings } from "@llamaindex/core/global";
import {
  type LoadTransformerEvent,
  loadTransformers,
} from "@llamaindex/env/multi-model";
import type {
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  PreTrainedTokenizer,
  Processor,
} from "@xenova/transformers";
import { ClipEmbeddingModelType } from "./shared";

declare module "@llamaindex/core/global" {
  interface LlamaIndexEventMaps {
    "load-transformers": LoadTransformerEvent;
  }
}

async function readImage(input: ImageType) {
  const { RawImage } = await loadTransformers((transformer) => {
    Settings.callbackManager.dispatchEvent(
      "load-transformers",
      {
        transformer,
      },
      true,
    );
  });
  if (input instanceof Blob) {
    return await RawImage.fromBlob(input);
  } else if (typeof input === "string" || input instanceof URL) {
    return await RawImage.fromURL(input);
  } else {
    throw new Error(`Unsupported input type: ${typeof input}`);
  }
}

export class ClipEmbedding extends MultiModalEmbedding {
  modelType: ClipEmbeddingModelType =
    ClipEmbeddingModelType.XENOVA_CLIP_VIT_BASE_PATCH16;

  private tokenizer: PreTrainedTokenizer | null = null;
  private processor: Processor | null = null;
  private visionModel: CLIPVisionModelWithProjection | null = null;
  private textModel: CLIPTextModelWithProjection | null = null;

  constructor() {
    super();
  }

  async getTokenizer() {
    const { AutoTokenizer } = await loadTransformers((transformer) => {
      Settings.callbackManager.dispatchEvent(
        "load-transformers",
        {
          transformer,
        },
        true,
      );
    });
    if (!this.tokenizer) {
      this.tokenizer = await AutoTokenizer.from_pretrained(this.modelType);
    }
    return this.tokenizer;
  }

  async getProcessor() {
    const { AutoProcessor } = await loadTransformers((transformer) => {
      Settings.callbackManager.dispatchEvent(
        "load-transformers",
        {
          transformer,
        },
        true,
      );
    });
    if (!this.processor) {
      this.processor = await AutoProcessor.from_pretrained(this.modelType);
    }
    return this.processor;
  }

  async getVisionModel() {
    const { CLIPVisionModelWithProjection } = await loadTransformers(
      (transformer) => {
        Settings.callbackManager.dispatchEvent(
          "load-transformers",
          {
            transformer,
          },
          true,
        );
      },
    );
    if (!this.visionModel) {
      this.visionModel = await CLIPVisionModelWithProjection.from_pretrained(
        this.modelType,
      );
    }

    return this.visionModel;
  }

  async getTextModel() {
    const { CLIPTextModelWithProjection } = await loadTransformers(
      (transformer) => {
        Settings.callbackManager.dispatchEvent(
          "load-transformers",
          {
            transformer,
          },
          true,
        );
      },
    );
    if (!this.textModel) {
      this.textModel = await CLIPTextModelWithProjection.from_pretrained(
        this.modelType,
      );
    }

    return this.textModel;
  }

  async getImageEmbedding(image: ImageType): Promise<number[]> {
    const loadedImage = await readImage(image);
    const imageInputs = await (await this.getProcessor())(loadedImage);
    const { image_embeds } = await (await this.getVisionModel())(imageInputs);
    return Array.from(image_embeds.data);
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const textInputs = await (
      await this.getTokenizer()
    )([text], { padding: true, truncation: true });
    const { text_embeds } = await (await this.getTextModel())(textInputs);
    return text_embeds.data;
  }
}
