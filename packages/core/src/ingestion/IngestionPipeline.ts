import { BaseNode, Document } from "../Node";
import { BaseReader } from "../readers/base";
import { BaseDocumentStore, VectorStore } from "../storage";
import { DocStoreStrategy, createDocStoreStrategy } from "./strategies";
import { TransformComponent } from "./types";

interface IngestionRunArgs {
  documents?: Document[];
  nodes?: BaseNode[];
  inPlace?: boolean;
}

export async function runTransformations(
  nodesToRun: BaseNode[],
  transformations: TransformComponent[],
  transformOptions: any = {},
  { inPlace = true }: IngestionRunArgs,
): Promise<BaseNode[]> {
  let nodes = nodesToRun;
  if (!inPlace) {
    nodes = [...nodesToRun];
  }
  for (const transform of transformations) {
    nodes = await transform.transform(nodes, transformOptions);
  }
  return nodes;
}

// TODO: add caching, add concurrency
export class IngestionPipeline {
  transformations: TransformComponent[] = [];
  documents?: Document[];
  reader?: BaseReader;
  vectorStore?: VectorStore;
  docStore?: BaseDocumentStore;
  docStoreStrategy: DocStoreStrategy = DocStoreStrategy.UPSERTS;
  disableCache: boolean = true;

  private _docStoreStrategy?: TransformComponent;

  constructor(init?: Partial<IngestionPipeline>) {
    Object.assign(this, init);
    this._docStoreStrategy = createDocStoreStrategy(
      this.docStoreStrategy,
      this.docStore,
      this.vectorStore,
    );
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
    args: IngestionRunArgs = {},
    transformOptions?: any,
  ): Promise<BaseNode[]> {
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
