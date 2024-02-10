import { BaseNode, Document } from "../Node";
import { BaseReader } from "../readers/type";
import { BaseDocumentStore, VectorStore } from "../storage";
import { IngestionCache, getTransformationHash } from "./IngestionCache";
import { DocStoreStrategy, createDocStoreStrategy } from "./strategies";
import { TransformComponent } from "./types";

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

  private _docStoreStrategy?: TransformComponent;

  constructor(init?: Partial<IngestionPipeline>) {
    Object.assign(this, init);
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
}
