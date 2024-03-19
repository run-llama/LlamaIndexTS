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
};

export async function runTransformations(
  nodesToRun: BaseNode[],
  transformations: TransformComponent[],
  transformOptions: any = {},
  { inPlace = true, cache }: TransformRunArgs = {},
): Promise<BaseNode[]> {
  let nodes = nodesToRun;
  if (!inPlace) {
    nodes = [...nodesToRun];
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
    const inputNodes: BaseNode[] = [];
    if (documents) {
      inputNodes.push(...documents);
    }
    if (nodes) {
      inputNodes.push(...nodes);
    }
    if (this.documents) {
      inputNodes.push(...this.documents);
    }
    if (this.reader) {
      inputNodes.push(...(await this.reader.loadData()));
    }
    return inputNodes;
  }

  async run(
    args: IngestionRunArgs & TransformRunArgs = {},
    transformOptions?: any,
  ): Promise<BaseNode[]> {
    args.cache = args.cache ?? this.cache;
    const inputNodes = await this.prepareInput(args.documents, args.nodes);
    let nodesToRun;
    if (this._docStoreStrategy) {
      nodesToRun = await this._docStoreStrategy.transform(inputNodes);
    } else {
      nodesToRun = inputNodes;
    }

    const nodes = await runTransformations(
      nodesToRun,
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
