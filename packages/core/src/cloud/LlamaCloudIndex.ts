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

import { ManagedIngestionStatus } from "@llamaindex/cloud";
import { getEnv } from "@llamaindex/env";
import { OpenAIEmbedding } from "../embeddings/OpenAIEmbedding.js";
import { SimpleNodeParser } from "../nodeParsers/SimpleNodeParser.js";

export class LlamaCloudIndex {
  params: CloudConstructorParams;

  constructor(params: CloudConstructorParams) {
    this.params = params;
  }

  private async waitForPipelineIngestion(
    verbose = false,
    raiseOnError = false,
  ): Promise<void> {
    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    const client = getClient({ ...this.params, baseUrl: this.params.baseUrl });

    if (verbose) {
      console.log("Waiting for pipeline ingestion: ");
    }

    while (true) {
      const pipelineStatus =
        await client.getPipelineStatusApiV1PipelinesPipelineIdStatusGet({
          pipelineId,
        });

      if (pipelineStatus.status === ManagedIngestionStatus.SUCCESS) {
        if (verbose) {
          console.log("Pipeline ingestion completed successfully");
        }
        break;
      }

      if (pipelineStatus.status === ManagedIngestionStatus.ERROR) {
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
    verbose = false,
    raiseOnError = false,
  ): Promise<void> {
    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    const client = getClient({ ...this.params, baseUrl: this.params.baseUrl });

    if (verbose) {
      console.log("Loading data: ");
    }

    const pendingDocs = new Set(docIds);

    while (pendingDocs.size) {
      const docsToRemove = new Set<string>();

      for (const doc of pendingDocs) {
        const { status } =
          await client.getPipelineDocumentStatusApiV1PipelinesPipelineIdDocumentsDocumentIdStatusGet(
            {
              pipelineId,
              documentId: doc,
            },
          );

        if (
          status === ManagedIngestionStatus.NOT_STARTED ||
          status === ManagedIngestionStatus.IN_PROGRESS
        ) {
          continue;
        }

        if (status === ManagedIngestionStatus.ERROR) {
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
    const client = getClient({ ...this.params, baseUrl: this.params.baseUrl });

    const pipelines = await client.searchPipelinesApiV1PipelinesGet({
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

    const appUrl = getAppBaseUrl(params.baseUrl);

    const client = getClient({ ...params, baseUrl: appUrl });

    const pipelineCreateParams = await getPipelineCreate({
      pipelineName: params.name,
      pipelineType: "MANAGED",
      inputNodes: params.documents,
      transformations: params.transformations ?? defaultTransformations,
    });

    const project = await client.upsertProjectApiV1ProjectsPut({
      requestBody: {
        name: params.projectName ?? "default",
      },
    });

    if (!project.id) {
      throw new Error("Project ID should be defined");
    }

    const pipeline = await client.upsertPipelineApiV1PipelinesPut({
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

    await client.upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut(
      {
        pipelineId: pipeline.id,
        requestBody: params.documents.map((doc) => ({
          metadata: doc.metadata,
          text: doc.text,
          excluded_llm_metadata_keys: doc.excludedLlmMetadataKeys,
          excluded_embed_metadata_keys: doc.excludedEmbedMetadataKeys,
          id: doc.id_,
        })),
      },
    );

    while (true) {
      const pipelineStatus =
        await client.getPipelineStatusApiV1PipelinesPipelineIdStatusGet({
          pipelineId: pipeline.id,
        });

      if (pipelineStatus.status === ManagedIngestionStatus.SUCCESS) {
        console.info(
          "Documents ingested successfully, pipeline is ready to use",
        );
        break;
      }

      if (pipelineStatus.status === ManagedIngestionStatus.ERROR) {
        console.error(
          `Some documents failed to ingest, check your pipeline logs at ${appUrl}/project/${project.id}/deploy/${pipeline.id}`,
        );
        throw new Error("Some documents failed to ingest");
      }

      if (pipelineStatus.status === ManagedIngestionStatus.PARTIAL_SUCCESS) {
        console.info(
          `Documents ingestion partially succeeded, to check a more complete status check your pipeline at ${appUrl}/project/${project.id}/deploy/${pipeline.id}`,
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

  async insert(document: Document) {
    const appUrl = getAppBaseUrl(this.params.baseUrl);

    const client = getClient({ ...this.params, baseUrl: appUrl });

    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await client.createBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPost(
      {
        pipelineId: pipelineId,
        requestBody: [
          {
            metadata: document.metadata,
            text: document.text,
            excluded_llm_metadata_keys: document.excludedLlmMetadataKeys,
            excluded_embed_metadata_keys: document.excludedEmbedMetadataKeys,
            id: document.id_,
          },
        ],
      },
    );

    await this.waitForDocumentIngestion([document.id_]);
  }

  async delete(document: Document) {
    const appUrl = getAppBaseUrl(this.params.baseUrl);

    const client = getClient({ ...this.params, baseUrl: appUrl });

    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await client.deletePipelineDocumentApiV1PipelinesPipelineIdDocumentsDocumentIdDelete(
      {
        pipelineId: pipelineId,
        documentId: document.id_,
      },
    );

    await this.waitForPipelineIngestion();
  }

  async refresh_doc(document: Document) {
    const appUrl = getAppBaseUrl(this.params.baseUrl);

    const client = getClient({ ...this.params, baseUrl: appUrl });

    const pipelineId = await this.getPipelineId(
      this.params.name,
      this.params.projectName,
    );

    if (!pipelineId) {
      throw new Error("We couldn't find the pipeline ID for the given name");
    }

    await client.upsertBatchPipelineDocumentsApiV1PipelinesPipelineIdDocumentsPut(
      {
        pipelineId: pipelineId,
        requestBody: [
          {
            metadata: document.metadata,
            text: document.text,
            excluded_llm_metadata_keys: document.excludedLlmMetadataKeys,
            excluded_embed_metadata_keys: document.excludedEmbedMetadataKeys,
            id: document.id_,
          },
        ],
      },
    );

    await this.waitForDocumentIngestion([document.id_]);
  }
}
