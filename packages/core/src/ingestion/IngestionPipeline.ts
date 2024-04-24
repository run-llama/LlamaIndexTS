import type { PlatformApiClient } from "@llamaindex/cloud";
import type { BaseNode, Document } from "../Node.js";
import { getPipelineCreate } from "../cloud/config.js";
import {
  DEFAULT_PIPELINE_NAME,
  DEFAULT_PROJECT_NAME,
  type ClientParams,
} from "../cloud/types.js";
import { getAppBaseUrl, getClient } from "../cloud/utils.js";
import type { BaseReader } from "../readers/type.js";
import type { BaseDocumentStore } from "../storage/docStore/types.js";
import type { VectorStore } from "../storage/vectorStore/types.js";
import { IngestionCache, getTransformationHash } from "./IngestionCache.js";
import {
  DocStoreStrategy,
  createDocStoreStrategy,
} from "./strategies/index.js";
import type { TransformComponent } from "./types.js";

type IngestionRunArgs = {
  documents?: Document[];
  nodes?: BaseNode[];
};

type TransformRunArgs = {
  inPlace?: boolean;
  cache?: IngestionCache;
  docStoreStrategy?: TransformComponent;
};

export async function runTransformations(
  nodesToRun: BaseNode[],
  transformations: TransformComponent[],
  transformOptions: any = {},
  { inPlace = true, cache, docStoreStrategy }: TransformRunArgs = {},
): Promise<BaseNode[]> {
  let nodes = nodesToRun;
  if (!inPlace) {
    nodes = [...nodesToRun];
  }
  if (docStoreStrategy) {
    nodes = await docStoreStrategy.transform(nodes);
  }
  for (const transform of transformations) {
    if (cache) {
      const hash = getTransformationHash(nodes, transform);
      const cachedNodes = await cache.get(hash);
      if (cachedNodes) {
        nodes = cachedNodes;
      } else {
        nodes = await transform.transform(nodes, transformOptions);
        await cache.put(hash, nodes);
      }
    } else {
      nodes = await transform.transform(nodes, transformOptions);
    }
  }
  return nodes;
}

export class IngestionPipeline {
  transformations: TransformComponent[] = [];
  documents?: Document[];
  reader?: BaseReader;
  vectorStore?: VectorStore;
  docStore?: BaseDocumentStore;
  docStoreStrategy: DocStoreStrategy = DocStoreStrategy.UPSERTS;
  cache?: IngestionCache;
  disableCache: boolean = false;
  client?: PlatformApiClient;
  clientParams?: ClientParams;
  projectName: string = DEFAULT_PROJECT_NAME;
  name: string = DEFAULT_PIPELINE_NAME;

  private _docStoreStrategy?: TransformComponent;

  constructor(init?: Partial<IngestionPipeline> & ClientParams) {
    Object.assign(this, init);
    this.clientParams = { apiKey: init?.apiKey, baseUrl: init?.baseUrl };
    if (!this.docStore) {
      this.docStoreStrategy = DocStoreStrategy.NONE;
    }
    this._docStoreStrategy = createDocStoreStrategy(
      this.docStoreStrategy,
      this.docStore,
      this.vectorStore,
    );
    if (!this.disableCache) {
      this.cache = new IngestionCache();
    }
  }

  async prepareInput(
    documents?: Document[],
    nodes?: BaseNode[],
  ): Promise<BaseNode[]> {
    let inputNodes: BaseNode[] = [];
    if (documents) {
      inputNodes = inputNodes.concat(documents);
    }
    if (nodes) {
      inputNodes = inputNodes.concat(nodes);
    }
    if (this.documents) {
      inputNodes = inputNodes.concat(this.documents);
    }
    if (this.reader) {
      inputNodes = inputNodes.concat(await this.reader.loadData()));
    }
    return inputNodes;
  }

  async run(
    args: IngestionRunArgs & TransformRunArgs = {},
    transformOptions?: any,
  ): Promise<BaseNode[]> {
    args.cache = args.cache ?? this.cache;
    args.docStoreStrategy = args.docStoreStrategy ?? this._docStoreStrategy;
    const inputNodes = await this.prepareInput(args.documents, args.nodes);
    const nodes = await runTransformations(
      inputNodes,
      this.transformations,
      transformOptions,
      args,
    );
    if (this.vectorStore) {
      const nodesToAdd = nodes.filter((node) => node.embedding);
      await this.vectorStore.add(nodesToAdd);
    }
    return nodes;
  }

  private async getClient(): Promise<PlatformApiClient> {
    if (!this.client) {
      this.client = await getClient(this.clientParams);
    }
    return this.client;
  }

  async register(params: {
    documents?: Document[];
    nodes?: BaseNode[];
    verbose?: boolean;
  }): Promise<string> {
    const client = await this.getClient();

    const inputNodes = await this.prepareInput(params.documents, params.nodes);
    const project = await client.project.upsertProject({
      name: this.projectName,
    });
    if (!project.id) {
      throw new Error("Project ID should be defined");
    }

    // upload
    const pipeline = await client.project.upsertPipelineForProject(
      project.id,
      await getPipelineCreate({
        pipelineName: this.name,
        pipelineType: "PLAYGROUND",
        transformations: this.transformations,
        inputNodes,
      }),
    );
    if (!pipeline.id) {
      throw new Error("Pipeline ID must be defined");
    }

    // Print playground URL if not running remote
    if (params.verbose) {
      console.log(
        `Pipeline available at: ${getAppBaseUrl(this.clientParams?.baseUrl)}/project/${project.id}/playground/${pipeline.id}`,
      );
    }

    return pipeline.id;
  }
}
