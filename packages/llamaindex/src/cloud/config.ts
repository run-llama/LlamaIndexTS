import type {
  ConfiguredTransformationItem,
  PipelineCreate,
  PipelineType,
} from "@llamaindex/cloud/api";
import { SentenceSplitter } from "@llamaindex/core/node-parser";
import { BaseNode, type TransformComponent } from "@llamaindex/core/schema";
import { OpenAIEmbedding } from "@llamaindex/openai";

export type GetPipelineCreateParams = {
  pipelineName: string;
  pipelineType: PipelineType;
  transformations?: TransformComponent[];
  inputNodes?: BaseNode[];
};

function getTransformationConfig(
  transformation: TransformComponent,
): ConfiguredTransformationItem {
  if (transformation instanceof SentenceSplitter) {
    return {
      configurable_transformation_type: "SENTENCE_AWARE_NODE_PARSER",
      component: {
        chunk_size: transformation.chunkSize, // TODO: set to public in SentenceSplitter
        chunk_overlap: transformation.chunkOverlap, // TODO: set to public in SentenceSplitter
        include_metadata: transformation.includeMetadata,
        include_prev_next_rel: transformation.includePrevNextRel,
      },
    };
  }
  if (transformation instanceof OpenAIEmbedding) {
    return {
      configurable_transformation_type: "OPENAI_EMBEDDING",
      component: {
        model: transformation.model,
        api_key: transformation.apiKey,
        embed_batch_size: transformation.embedBatchSize,
        dimensions: transformation.dimensions,
      },
    };
  }
  throw new Error(`Unsupported transformation: ${typeof transformation}`);
}

export async function getPipelineCreate(
  params: GetPipelineCreateParams,
): Promise<PipelineCreate> {
  const { pipelineName, pipelineType, transformations = [] } = params;

  return {
    name: pipelineName,
    configured_transformations: transformations.map(getTransformationConfig),
    pipeline_type: pipelineType,
  };
}
