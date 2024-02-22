import { BaseRetriever } from "../Retriever";
import { RetrieverQueryEngine } from "../engines/query/RetrieverQueryEngine";
import { BaseNodePostprocessor } from "../postprocessors";
import { BaseSynthesizer } from "../synthesizers";
import { BaseQueryEngine } from "../types";
import { LlamaCloudRetriever, RetrieveParams } from "./LlamaCloudRetriever";
import { CloudConstructorParams } from "./types";

export class LlamaCloudIndex {
  params: CloudConstructorParams;

  constructor(params: CloudConstructorParams) {
    this.params = params;
  }

  asRetriever(params: RetrieveParams): BaseRetriever {
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
