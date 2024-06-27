import type { Document } from "@llamaindex/core/schema";
import type { BaseRetriever } from "../Retriever.js";
import { RetrieverQueryEngine } from "../engines/query/RetrieverQueryEngine.js";
import type { TransformComponent } from "../ingestion/types.js";
import type { BaseNodePostprocessor } from "../postprocessors/types.js";
import type { BaseSynthesizer } from "../synthesizers/types.js";
import type { QueryEngine } from "../types.js";
import type { CloudRetrieveParams } from "./LlamaCloudRetriever.js";
import { LlamaCloudRetriever } from "./LlamaCloudRetriever.js";
import { getPipelineCreate } from "./config.js";
import type { CloudConstructorParams } from "./constants.js";
import { getAppBaseUrl, initService } from "./utils.js";

import { PipelinesService, ProjectsService } from "@llamaindex/cloud/api";
import { getEnv } from "@llamaindex/env";
import { Settings } from "../Settings.js";
import { OpenAIEmbedding } from "../embeddings/OpenAIEmbedding.js";
import { SimpleNodeParser } from "../nodeParsers/SimpleNodeParser.js";

export class LlamaCloudIndex {
  params: CloudConstructorParams;

  constructor(params: CloudConstructorParams) {
    this.params = params;
    initService(this.params);
  }

  private async waitForPipelineIngestion(
    verbose = Settings.debug,
    raiseOnError = false,
  ): Promise<void> {
    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (verbose) {
      console.log("Waiting for pipeline ingestion: ");
    }

    while (true) {
      const pipelineStatus =
        await PipelinesService.getPipelineStatusApiV1PipelinesPipelineIdStatusGet(
          {
            pipelineId,
          },
        );

      if (pipelineStatus.status === "SUCCESS") {
        if (verbose) {
          console.log("Pipeline ingestion completed successfully");
        }
        break;
      }

      if (pipelineStatus.status === "ERROR") {
        if (verbose) {
          console.error("Pipeline ingestion failed");
        }

        if (raiseOnError) {
          throw new Error("Pipeline ingestion failed");
        }
      }

      if (verbose) {
        process.stdout.write(".");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  private async waitForDocumentIngestion(
    docIds: string[],
    verbose = Settings.debug,
    raiseOnError = false,
  ): Promise<void> {
    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (verbose) {
      console.log("Loading data: ");
    }

    const pendingDocs = new Set(docIds);

    while (pendingDocs.size) {
      const docsToRemove = new Set<string>();

      for (const doc of pendingDocs) {
        const { status } =
          await PipelinesService.getPipelineDocumentStatusApiV1PipelinesPipelineIdDocumentsDocumentIdStatusGet(
            { pipelineId, documentId: doc },
          );

        if (status === "NOT_STARTED" || status === "IN_PROGRESS") {
          continue;
        }

        if (status === "ERROR") {
          if (verbose) {
            console.error(`Document ingestion failed for ${doc}`);
          }

          if (raiseOnError) {
            throw new Error(`Document ingestion failed for ${doc}`);
          }
        }

        docsToRemove.add(doc);
      }

      for (const doc of docsToRemove) {
        pendingDocs.delete(doc);
      }

      if (pendingDocs.size) {
        if (verbose) {
          process.stdout.write(".");
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (verbose) {
      console.log("Done!");
    }

    await this.waitForPipelineIngestion(verbose, raiseOnError);
  }

  private async getPipelineId(
    name: string,
    projectName: string,
  ): Promise<string> {
    const pipelines = await PipelinesService.searchPipelinesApiV1PipelinesGet({
      projectName,
      pipelineName: name,
    });

    return pipelines[0].id;
  }

  static async fromDocuments(
    params: {
      documents: Document[];
      transformations?: TransformComponent[];
      verbose?: boolean;
    } & CloudConstructorParams,
  ): Promise<LlamaCloudIndex> {
    const defaultTransformations: TransformComponent[] = [
      new SimpleNodeParser(),
      new OpenAIEmbedding({
        apiKey: getEnv("OPENAI_API_KEY"),
      }),
    ];
    const apiUrl = getAppBaseUrl();

    const pipelineCreateParams = await getPipelineCreate({
      pipelineName: params.name,
      pipelineType: "MANAGED",
      inputNodes: params.documents,
      transformations: params.transformations ?? defaultTransformations,
    });

    const project = await ProjectsService.upsertProjectApiV1ProjectsPut({
      requestBody: {
        name: params.projectName ?? "default",
      },
    });

    if (!project.id) {
      throw new Error("Project ID should be defined");
    }

    const pipeline = await PipelinesService.upsertPipelineApiV1PipelinesPut({
      projectId: project.id,
      requestBody: {
        name: params.name,
        configured_transformations:
          pipelineCreateParams.configured_transformations,
        pipeline_type: pipelineCreateParams.pipeline_type,
      },
    });

    if (!pipeline.id) {
      throw new Error("Pipeline ID must be defined");
    }

    if (params.verbose) {
      console.log(`Created pipeline ${pipeline.id} with name ${params.name}`);
    }

    await PipelinesService.upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut(
      {
        pipelineId: pipeline.id,
        requestBody: params.documents.map((doc) => ({
          metadata: doc.metadata,
          text: doc.text,
          excluded_embed_metadata_keys: doc.excludedEmbedMetadataKeys,
          excluded_llm_metadata_keys: doc.excludedEmbedMetadataKeys,
          id: doc.id_,
        })),
      },
    );

    while (true) {
      const pipelineStatus =
        await PipelinesService.getPipelineStatusApiV1PipelinesPipelineIdStatusGet(
          {
            pipelineId: pipeline.id,
          },
        );

      if (pipelineStatus.status === "SUCCESS") {
        console.info(
          "Documents ingested successfully, pipeline is ready to use",
        );
        break;
      }

      if (pipelineStatus.status === "ERROR") {
        console.error(
          `Some documents failed to ingest, check your pipeline logs at ${apiUrl}/project/${project.id}/deploy/${pipeline.id}`,
        );
        throw new Error("Some documents failed to ingest");
      }

      if (pipelineStatus.status === "PARTIAL_SUCCESS") {
        console.info(
          `Documents ingestion partially succeeded, to check a more complete status check your pipeline at ${apiUrl}/project/${project.id}/deploy/${pipeline.id}`,
        );
        break;
      }

      if (params.verbose) {
        process.stdout.write(".");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (params.verbose) {
      console.info(
        `Ingestion completed, find your index at ${apiUrl}/project/${project.id}/deploy/${pipeline.id}`,
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

  async insert(document: Document) {
    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await PipelinesService.createBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPost(
      {
        pipelineId: pipelineId,
        requestBody: [
          {
            metadata: document.metadata,
            text: document.text,
            excluded_embed_metadata_keys: document.excludedLlmMetadataKeys,
            excluded_llm_metadata_keys: document.excludedEmbedMetadataKeys,
            id: document.id_,
          },
        ],
      },
    );

    await this.waitForDocumentIngestion([document.id_]);
  }

  async delete(document: Document) {
    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await PipelinesService.deletePipelineDocumentApiV1PipelinesPipelineIdDocumentsDocumentIdDelete(
      {
        pipelineId,
        documentId: document.id_,
      },
    );

    await this.waitForPipelineIngestion();
  }

  async refreshDoc(document: Document) {
    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await PipelinesService.upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut(
      {
        pipelineId,
        requestBody: [
          {
            metadata: document.metadata,
            text: document.text,
            excluded_embed_metadata_keys: document.excludedLlmMetadataKeys,
            excluded_llm_metadata_keys: document.excludedEmbedMetadataKeys,
            id: document.id_,
          },
        ],
      },
    );

    await this.waitForDocumentIngestion([document.id_]);
  }
}
