import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import type { Document, TransformComponent } from "@llamaindex/core/schema";
import { RetrieverQueryEngine } from "../engines/query/RetrieverQueryEngine.js";
import type { BaseNodePostprocessor } from "../postprocessors/types.js";
import type { CloudRetrieveParams } from "./LlamaCloudRetriever.js";
import { LlamaCloudRetriever } from "./LlamaCloudRetriever.js";
import { getPipelineCreate } from "./config.js";
import type { CloudConstructorParams } from "./type.js";
import {
  getAppBaseUrl,
  getPipelineId,
  getProjectId,
  initService,
} from "./utils.js";

import { PipelinesService, ProjectsService } from "@llamaindex/cloud/api";
import { SentenceSplitter } from "@llamaindex/core/node-parser";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import { getEnv } from "@llamaindex/env";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { Settings } from "../Settings.js";

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
    const pipelineId = await this.getPipelineId();

    if (verbose) {
      console.log("Waiting for pipeline ingestion: ");
    }

    while (true) {
      const { data: pipelineStatus } =
        await PipelinesService.getPipelineStatusApiV1PipelinesPipelineIdStatusGet(
          {
            path: {
              pipeline_id: pipelineId,
            },
            throwOnError: true,
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
    const pipelineId = await this.getPipelineId();

    if (verbose) {
      console.log("Loading data: ");
    }

    const pendingDocs = new Set(docIds);

    while (pendingDocs.size) {
      const docsToRemove = new Set<string>();

      for (const doc of pendingDocs) {
        const {
          data: { status },
        } =
          await PipelinesService.getPipelineDocumentStatusApiV1PipelinesPipelineIdDocumentsDocumentIdStatusGet(
            {
              path: { pipeline_id: pipelineId, document_id: doc },
              throwOnError: true,
            },
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

  public async getPipelineId(
    name?: string,
    projectName?: string,
    organizationId?: string,
  ): Promise<string> {
    return await getPipelineId(
      name ?? this.params.name,
      projectName ?? this.params.projectName,
      organizationId ?? this.params.organizationId,
    );
  }

  public async getProjectId(
    projectName?: string,
    organizationId?: string,
  ): Promise<string> {
    return await getProjectId(
      projectName ?? this.params.projectName,
      organizationId ?? this.params.organizationId,
    );
  }

  static async fromDocuments(
    params: {
      documents: Document[];
      transformations?: TransformComponent[];
      verbose?: boolean;
    } & CloudConstructorParams,
  ): Promise<LlamaCloudIndex> {
    initService(params);
    const defaultTransformations: TransformComponent[] = [
      new SentenceSplitter(),
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

    const { data: project } =
      await ProjectsService.upsertProjectApiV1ProjectsPut({
        path: {
          organization_id: params.organizationId,
        },
        body: {
          name: params.projectName ?? "default",
        },
        throwOnError: true,
      });

    if (!project.id) {
      throw new Error("Project ID should be defined");
    }

    const { data: pipeline } =
      await PipelinesService.upsertPipelineApiV1PipelinesPut({
        path: {
          project_id: project.id,
        },
        body: pipelineCreateParams.configured_transformations
          ? {
              name: params.name,
              configured_transformations:
                pipelineCreateParams.configured_transformations,
            }
          : {
              name: params.name,
            },
        throwOnError: true,
      });

    if (!pipeline.id) {
      throw new Error("Pipeline ID must be defined");
    }

    if (params.verbose) {
      console.log(`Created pipeline ${pipeline.id} with name ${params.name}`);
    }

    await PipelinesService.upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut(
      {
        path: {
          pipeline_id: pipeline.id,
        },
        body: params.documents.map((doc) => ({
          metadata: doc.metadata,
          text: doc.text,
          excluded_embed_metadata_keys: doc.excludedEmbedMetadataKeys,
          excluded_llm_metadata_keys: doc.excludedEmbedMetadataKeys,
          id: doc.id_,
        })),
      },
    );

    while (true) {
      const { data: pipelineStatus } =
        await PipelinesService.getPipelineStatusApiV1PipelinesPipelineIdStatusGet(
          {
            path: { pipeline_id: pipeline.id },
            throwOnError: true,
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
  ): BaseQueryEngine {
    const retriever = new LlamaCloudRetriever({
      ...this.params,
      ...params,
    });
    return new RetrieverQueryEngine(
      retriever,
      params?.responseSynthesizer,
      params?.nodePostprocessors,
    );
  }

  async insert(document: Document) {
    const pipelineId = await this.getPipelineId();

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await PipelinesService.createBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPost(
      {
        path: {
          pipeline_id: pipelineId,
        },
        body: [
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
    const pipelineId = await this.getPipelineId();

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await PipelinesService.deletePipelineDocumentApiV1PipelinesPipelineIdDocumentsDocumentIdDelete(
      {
        path: {
          pipeline_id: pipelineId,
          document_id: document.id_,
        },
      },
    );

    await this.waitForPipelineIngestion();
  }

  async refreshDoc(document: Document) {
    const pipelineId = await this.getPipelineId();

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await PipelinesService.upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut(
      {
        path: {
          pipeline_id: pipelineId,
        },
        body: [
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
