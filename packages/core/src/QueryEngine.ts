import { NodeWithScore, TextNode } from "./Node";
import { LLMQuestionGenerator } from "./QuestionGenerator";
import { Response } from "./Response";
import { BaseRetriever } from "./Retriever";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";
import { Event } from "./callbacks/CallbackManager";
import { randomUUID } from "./env";
import { BaseNodePostprocessor } from "./postprocessors";
import { LLMSingleSelector } from "./selectors";
import { BaseSelector } from "./selectors/base";
import {
  BaseSynthesizer,
  CompactAndRefine,
  ResponseSynthesizer,
  TreeSummarize,
} from "./synthesizers";
import {
  BaseQueryEngine,
  BaseQuestionGenerator,
  QueryBundle,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
  QueryEngineTool,
  SubQuestion,
  ToolMetadata,
} from "./types";

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine implements BaseQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: BaseSynthesizer;
  nodePostprocessors: BaseNodePostprocessor[];
  preFilters?: unknown;

  constructor(
    retriever: BaseRetriever,
    responseSynthesizer?: BaseSynthesizer,
    preFilters?: unknown,
    nodePostprocessors?: BaseNodePostprocessor[],
  ) {
    this.retriever = retriever;
    const serviceContext: ServiceContext | undefined =
      this.retriever.getServiceContext();
    this.responseSynthesizer =
      responseSynthesizer || new ResponseSynthesizer({ serviceContext });
    this.preFilters = preFilters;
    this.nodePostprocessors = nodePostprocessors || [];
  }

  private applyNodePostprocessors(nodes: NodeWithScore[]) {
    return this.nodePostprocessors.reduce(
      (nodes, nodePostprocessor) => nodePostprocessor.postprocessNodes(nodes),
      nodes,
    );
  }

  private async retrieve(query: string, parentEvent: Event) {
    const nodes = await this.retriever.retrieve(
      query,
      parentEvent,
      this.preFilters,
    );

    return this.applyNodePostprocessors(nodes);
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;
    const parentEvent: Event = params.parentEvent || {
      id: randomUUID(),
      type: "wrapper",
      tags: ["final"],
    };
    const nodesWithScore = await this.retrieve(query, parentEvent);
    if (stream) {
      return this.responseSynthesizer.synthesize({
        query,
        nodesWithScore,
        parentEvent,
        stream: true,
      });
    }
    return this.responseSynthesizer.synthesize({
      query,
      nodesWithScore,
      parentEvent,
    });
  }
}

/**
 * SubQuestionQueryEngine decomposes a question into subquestions and then
 */
export class SubQuestionQueryEngine implements BaseQueryEngine {
  responseSynthesizer: BaseSynthesizer;
  questionGen: BaseQuestionGenerator;
  queryEngines: Record<string, BaseQueryEngine>;
  metadatas: ToolMetadata[];

  constructor(init: {
    questionGen: BaseQuestionGenerator;
    responseSynthesizer: BaseSynthesizer;
    queryEngineTools: QueryEngineTool[];
  }) {
    this.questionGen = init.questionGen;
    this.responseSynthesizer =
      init.responseSynthesizer ?? new ResponseSynthesizer();
    this.queryEngines = init.queryEngineTools.reduce<
      Record<string, BaseQueryEngine>
    >((acc, tool) => {
      acc[tool.metadata.name] = tool.queryEngine;
      return acc;
    }, {});
    this.metadatas = init.queryEngineTools.map((tool) => tool.metadata);
  }

  static fromDefaults(init: {
    queryEngineTools: QueryEngineTool[];
    questionGen?: BaseQuestionGenerator;
    responseSynthesizer?: BaseSynthesizer;
    serviceContext?: ServiceContext;
  }) {
    const serviceContext =
      init.serviceContext ?? serviceContextFromDefaults({});

    const questionGen = init.questionGen ?? new LLMQuestionGenerator();
    const responseSynthesizer =
      init.responseSynthesizer ??
      new ResponseSynthesizer({
        responseBuilder: new CompactAndRefine(serviceContext),
        serviceContext,
      });

    return new SubQuestionQueryEngine({
      questionGen,
      responseSynthesizer,
      queryEngineTools: init.queryEngineTools,
    });
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;
    const subQuestions = await this.questionGen.generate(this.metadatas, query);

    // groups final retrieval+synthesis operation
    const parentEvent: Event = params.parentEvent || {
      id: randomUUID(),
      type: "wrapper",
      tags: ["final"],
    };

    // groups all sub-queries
    const subQueryParentEvent: Event = {
      id: randomUUID(),
      parentId: parentEvent.id,
      type: "wrapper",
      tags: ["intermediate"],
    };

    const subQNodes = await Promise.all(
      subQuestions.map((subQ) => this.querySubQ(subQ, subQueryParentEvent)),
    );

    const nodesWithScore = subQNodes
      .filter((node) => node !== null)
      .map((node) => node as NodeWithScore);
    if (stream) {
      return this.responseSynthesizer.synthesize({
        query,
        nodesWithScore,
        parentEvent,
        stream: true,
      });
    }
    return this.responseSynthesizer.synthesize({
      query,
      nodesWithScore,
      parentEvent,
    });
  }

  private async querySubQ(
    subQ: SubQuestion,
    parentEvent?: Event,
  ): Promise<NodeWithScore | null> {
    try {
      const question = subQ.subQuestion;
      const queryEngine = this.queryEngines[subQ.toolName];

      const response = await queryEngine.query({
        query: question,
        parentEvent,
      });
      const responseText = response.response;
      const nodeText = `Sub question: ${question}\nResponse: ${responseText}`;
      const node = new TextNode({ text: nodeText });
      return { node, score: 0 };
    } catch (error) {
      return null;
    }
  }
}

async function combineResponses(
  summarizer: TreeSummarize,
  responses: Response[],
  queryBundle: QueryBundle,
  verbose: boolean = false,
): Promise<Response> {
  if (verbose) {
    console.log("Combining responses from multiple query engines.");
  }

  const responseStrs = [];
  const sourceNodes = [];

  for (const response of responses) {
    if (response?.sourceNodes) {
      sourceNodes.push(...response.sourceNodes);
    }

    responseStrs.push(response.response);
  }

  const summary = await summarizer.getResponse({
    query: queryBundle.queryStr,
    textChunks: responseStrs,
  });

  return new Response(summary, sourceNodes);
}

type RouterQueryEngineTool = {
  queryEngine: BaseQueryEngine;
  description: string;
};

type RouterQueryEngineMetadata = {
  description: string;
};

/**
 * A query engine that uses multiple query engines and selects the best one.
 */
export class RouterQueryEngine implements BaseQueryEngine {
  _selector: BaseSelector;
  _queryEngines: BaseQueryEngine[];
  serviceContext: ServiceContext;
  _metadatas: RouterQueryEngineMetadata[];
  _summarizer: TreeSummarize;
  _verbose: boolean;

  constructor(init: {
    selector: BaseSelector;
    queryEngineTools: RouterQueryEngineTool[];
    serviceContext?: ServiceContext;
    summarizer?: TreeSummarize;
    verbose?: boolean;
  }) {
    this.serviceContext = init.serviceContext || serviceContextFromDefaults({});
    this._selector = init.selector;
    this._queryEngines = init.queryEngineTools.map((tool) => tool.queryEngine);
    this._metadatas = init.queryEngineTools.map((tool) => ({
      description: tool.description,
    }));
    this._summarizer =
      init.summarizer || new TreeSummarize(this.serviceContext);
    this._verbose = init.verbose ?? false;
  }

  static fromDefaults(init: {
    queryEngineTools: RouterQueryEngineTool[];
    selector?: BaseSelector;
    serviceContext?: ServiceContext;
    summarizer?: TreeSummarize;
    verbose?: boolean;
  }) {
    const serviceContext =
      init.serviceContext ?? serviceContextFromDefaults({});

    return new RouterQueryEngine({
      selector:
        init.selector ?? new LLMSingleSelector({ llm: serviceContext.llm }),
      queryEngineTools: init.queryEngineTools,
      serviceContext,
      summarizer: init.summarizer,
      verbose: init.verbose,
    });
  }

  async _query(queryBundle: QueryBundle): Promise<Response> {
    const result = await this._selector.select(this._metadatas, queryBundle);

    if (result.selections.length > 1) {
      const responses = [];
      for (let i = 0; i < result.selections.length; i++) {
        const engineInd = result.selections[i];
        const logStr = `Selecting query engine ${engineInd}: ${result.selections[i]}.`;

        if (this._verbose) {
          console.log(logStr + "\n");
        }

        const selectedQueryEngine = this._queryEngines[engineInd.index];
        responses.push(
          await selectedQueryEngine.query({
            query: queryBundle.queryStr,
          }),
        );
      }

      if (responses.length > 1) {
        const finalResponse = await combineResponses(
          this._summarizer,
          responses,
          queryBundle,
          this._verbose,
        );

        return finalResponse;
      } else {
        return responses[0];
      }
    } else {
      let selectedQueryEngine;

      try {
        selectedQueryEngine = this._queryEngines[result.selections[0].index];

        const logStr = `Selecting query engine ${result.selections[0].index}: ${result.selections[0].reason}`;
        console.log(logStr);
        if (this._verbose) {
          console.log(logStr + "\n");
        }
      } catch (e) {
        throw new Error("Failed to select query engine");
      }

      if (!selectedQueryEngine) {
        throw new Error("Selected query engine is null");
      }

      const finalResponse = await selectedQueryEngine.query({
        query: queryBundle.queryStr,
      });

      // add selected result
      finalResponse.metadata = finalResponse.metadata || {};
      finalResponse.metadata["selectorResult"] = result;

      return finalResponse;
    }
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;

    const response = await this._query({ queryStr: query });

    if (stream) {
      return response;
    }

    return response;
  }
}
