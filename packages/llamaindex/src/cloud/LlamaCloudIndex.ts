import { PlatformApi } from "@llamaindex/cloud";
import type { Document } from "../Node.js";
import type { BaseRetriever } from "../Retriever.js";
import { RetrieverQueryEngine } from "../engines/query/RetrieverQueryEngine.js";
import type { TransformComponent } from "../ingestion/types.js";
import type { BaseNodePostprocessor } from "../postprocessors/types.js";
import type { BaseSynthesizer } from "../synthesizers/types.js";
import type { QueryEngine } from "../types.js";
import type { CloudRetrieveParams } from "./LlamaCloudRetriever.js";
import { LlamaCloudRetriever } from "./LlamaCloudRetriever.js";
import { getPipelineCreate } from "./config.js";
import type { CloudConstructorParams } from "./types.js";
import { getAppBaseUrl, getClient } from "./utils.js";

import { getEnv } from "@llamaindex/env";
import { OpenAIEmbedding } from "../embeddings/OpenAIEmbedding.js";
import { SimpleNodeParser } from "../nodeParsers/SimpleNodeParser.js";

export class LlamaCloudIndex {
  params: CloudConstructorParams;

  constructor(params: CloudConstructorParams) {
    this.params = params;
  }

  static async fromDocuments(
    params: {
      documents: Document[];
      transformations?: TransformComponent[];
      verbose?: boolean;
    } & CloudConstructorParams,
  ): Promise<LlamaCloudIndex> {
    const defaultTransformations: TransformComponent[] = [
      new OpenAIEmbedding({
        apiKey: getEnv("OPENAI_API_KEY"),
      }),
      new SimpleNodeParser(),
    ];

    const appUrl = getAppBaseUrl(params.baseUrl);

    const client = await getClient({ ...params, baseUrl: appUrl });

    const pipelineCreateParams = await getPipelineCreate({
      pipelineName: params.name,
      pipelineType: "MANAGED",
      inputNodes: params.documents,
      transformations: params.transformations ?? defaultTransformations,
    });

    const project = await client.project.upsertProject({
      name: params.projectName ?? "default",
    });

    if (!project.id) {
      throw new Error("Project ID should be defined");
    }

    const pipeline = await client.project.upsertPipelineForProject(
      project.id,
      pipelineCreateParams,
    );

    if (!pipeline.id) {
      throw new Error("Pipeline ID must be defined");
    }

    if (params.verbose) {
      console.log(`Created pipeline ${pipeline.id} with name ${params.name}`);
    }

    const executionsIds: {
      exectionId: string;
      dataSourceId: string;
    }[] = [];

    for (const dataSource of pipeline.dataSources) {
      const dataSourceExection =
        await client.dataSource.createDataSourceExecution(dataSource.id);

      if (!dataSourceExection.id) {
        throw new Error("Data Source Execution ID must be defined");
      }

      executionsIds.push({
        exectionId: dataSourceExection.id,
        dataSourceId: dataSource.id,
      });
    }

    let isDone = false;

    while (!isDone) {
      const statuses = [];

      for await (const execution of executionsIds) {
        const dataSourceExecution =
          await client.dataSource.getDataSourceExecution(
            execution.dataSourceId,
            execution.exectionId,
          );

        statuses.push(dataSourceExecution.status);

        if (
          statuses.every((status) => status === PlatformApi.StatusEnum.Success)
        ) {
          isDone = true;
          if (params.verbose) {
            console.info("Data Source Execution completed");
          }
          break;
        } else if (
          statuses.some((status) => status === PlatformApi.StatusEnum.Error)
        ) {
          throw new Error("Data Source Execution failed");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (params.verbose) {
            process.stdout.write(".");
          }
        }
      }
    }

    isDone = false;

    const execution = await client.pipeline.runManagedPipelineIngestion(
      pipeline.id,
    );

    const ingestionId = execution.id;

    if (!ingestionId) {
      throw new Error("Ingestion ID must be defined");
    }

    while (!isDone) {
      const pipelineStatus = await client.pipeline.getManagedIngestionExecution(
        pipeline.id,
        ingestionId,
      );

      if (pipelineStatus.status === PlatformApi.StatusEnum.Success) {
        isDone = true;

        if (params.verbose) {
          console.info("Ingestion completed");
        }

        break;
      } else if (pipelineStatus.status === PlatformApi.StatusEnum.Error) {
        throw new Error("Ingestion failed");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (params.verbose) {
          process.stdout.write(".");
        }
      }
    }

    if (params.verbose) {
      console.info(
        `Ingestion completed, find your index at ${appUrl}/project/${project.id}/deploy/${pipeline.id}`,
      );
    }

    return new LlamaCloudIndex({ ...params });
  }

  asRetriever(params: CloudRetrieveParams = {}): BaseRetriever {
    return new LlamaCloudRetriever({ ...this.params, ...params });
  }

  asQueryEngine(
    params?: {
      responseSynthesizer?: BaseSynthesizer;
      preFilters?: unknown;
      nodePostprocessors?: BaseNodePostprocessor[];
    } & CloudRetrieveParams,
  ): QueryEngine {
    const retriever = new LlamaCloudRetriever({
      ...this.params,
      ...params,
    });
    return new RetrieverQueryEngine(
      retriever,
      params?.responseSynthesizer,
      params?.preFilters,
      params?.nodePostprocessors,
    );
  }
}
