import type { BaseRetriever } from "../Retriever.js";
import { RetrieverQueryEngine } from "../engines/query/RetrieverQueryEngine.js";
import type { BaseNodePostprocessor } from "../postprocessors/types.js";
import type { BaseSynthesizer } from "../synthesizers/types.js";
import type { BaseQueryEngine } from "../types.js";
import type { RetrieveParams } from "./LlamaCloudRetriever.js";
import { LlamaCloudRetriever } from "./LlamaCloudRetriever.js";
import type { CloudConstructorParams } from "./types.js";

export class LlamaCloudIndex {
  params: CloudConstructorParams;

  constructor(params: CloudConstructorParams) {
    this.params = params;
  }

  asRetriever(params: RetrieveParams = {}): BaseRetriever {
    return new LlamaCloudRetriever({ ...this.params, ...params });
  }

  asQueryEngine(
    params?: {
      responseSynthesizer?: BaseSynthesizer;
      preFilters?: unknown;
      nodePostprocessors?: BaseNodePostprocessor[];
    } & RetrieveParams,
  ): BaseQueryEngine {
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
