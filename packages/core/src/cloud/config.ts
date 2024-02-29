import type { PlatformApi } from "@llamaindex/cloud";
import { BaseNode, TextNode } from "../Node.js";
import { OpenAIEmbedding } from "../embeddings/OpenAIEmbedding.js";
import type { TransformComponent } from "../ingestion/types.js";
import { SimpleNodeParser } from "../nodeParsers/SimpleNodeParser.js";

export type GetPipelineCreateParams = {
  pipelineName: string;
  pipelineType: PlatformApi.PipelineType;
  transformations?: TransformComponent[];
  inputNodes?: BaseNode[];
};

function getTransformationConfig(
  transformation: TransformComponent,
): PlatformApi.ConfiguredTransformationItem {
  if (transformation instanceof SimpleNodeParser) {
    return {
      configurableTransformationType: "SIMPLE_FILE_NODE_PARSER",
      component: {
        includeMetadata: transformation.includeMetadata,
        includePrevNextRel: transformation.includePrevNextRel,
      },
    };
  }
  if (transformation instanceof OpenAIEmbedding) {
    return {
      configurableTransformationType: "OPENAI_EMBEDDING",
      component: {
        modelName: transformation.model,
        embedBatchSize: transformation.embedBatchSize,
        dimensions: transformation.dimensions,
      },
    };
  }
  throw new Error(`Unsupported transformation: ${typeof transformation}`);
}

function getDataSourceConfig(node: BaseNode): PlatformApi.DataSourceCreate {
  if (node instanceof TextNode) {
    return {
      name: node.id_,
      sourceType: "TEXT_NODE",
      component: node.toMutableJSON(),
    };
  }
  if (node instanceof Document) {
    return {
      name: node.id_,
      sourceType: "DOCUMENT",
      component: node.toMutableJSON(),
    };
  }
  throw new Error(`Unsupported node: ${typeof node}`);
}

export async function getPipelineCreate(
  params: GetPipelineCreateParams,
): Promise<PlatformApi.PipelineCreate> {
  const {
    pipelineName,
    pipelineType,
    transformations = [],
    inputNodes = [],
  } = params;

  return {
    name: pipelineName,
    configuredTransformations: transformations.map(getTransformationConfig),
    dataSources: inputNodes.map(getDataSourceConfig),
    dataSinks: [],
    pipelineType,
  };
}
