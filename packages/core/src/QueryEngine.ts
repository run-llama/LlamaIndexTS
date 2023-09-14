import { v4 as uuidv4 } from "uuid";
import { NodeWithScore, TextNode } from "./Node";
import {
  BaseQuestionGenerator,
  LLMQuestionGenerator,
  SubQuestion,
} from "./QuestionGenerator";
import { Response } from "./Response";
import { CompactAndRefine, ResponseSynthesizer, TreeSummarize} from "./ResponseSynthesizer";
import { BaseRetriever } from "./Retriever";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";
import { QueryEngineTool, ToolMetadata } from "./Tool";
import { Event } from "./callbacks/CallbackManager";
import { BaseSelector, Selection } from "./Selector";

/**
 * A query engine is a question answerer that can use one or more steps.
 */
export interface BaseQueryEngine {
  /**
   * Query the query engine and get a response.
   * @param query
   * @param parentEvent
   */
  query(query: string, parentEvent?: Event): Promise<Response>;
}

/**
 * A query engine that uses a retriever to query an index and then synthesizes the response.
 */
export class RetrieverQueryEngine implements BaseQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: ResponseSynthesizer;

  constructor(
    retriever: BaseRetriever,
    responseSynthesizer?: ResponseSynthesizer,
  ) {
    this.retriever = retriever;
    const serviceContext: ServiceContext | undefined =
      this.retriever.getServiceContext();
    this.responseSynthesizer =
      responseSynthesizer || new ResponseSynthesizer({ serviceContext });
  }

  async query(query: string, parentEvent?: Event) {
    const _parentEvent: Event = parentEvent || {
      id: uuidv4(),
      type: "wrapper",
      tags: ["final"],
    };
    const nodes = await this.retriever.retrieve(query, _parentEvent);
    return this.responseSynthesizer.synthesize(query, nodes, _parentEvent);
  }
}

/**
 * SubQuestionQueryEngine decomposes a question into subquestions and then
 */
export class SubQuestionQueryEngine implements BaseQueryEngine {
  responseSynthesizer: ResponseSynthesizer;
  questionGen: BaseQuestionGenerator;
  queryEngines: Record<string, BaseQueryEngine>;
  metadatas: ToolMetadata[];

  constructor(init: {
    questionGen: BaseQuestionGenerator;
    responseSynthesizer: ResponseSynthesizer;
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
    responseSynthesizer?: ResponseSynthesizer;
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

  async query(query: string): Promise<Response> {
    const subQuestions = await this.questionGen.generate(this.metadatas, query);

    // groups final retrieval+synthesis operation
    const parentEvent: Event = {
      id: uuidv4(),
      type: "wrapper",
      tags: ["final"],
    };

    // groups all sub-queries
    const subQueryParentEvent: Event = {
      id: uuidv4(),
      parentId: parentEvent.id,
      type: "wrapper",
      tags: ["intermediate"],
    };

    const subQNodes = await Promise.all(
      subQuestions.map((subQ) => this.querySubQ(subQ, subQueryParentEvent)),
    );

    const nodes = subQNodes
      .filter((node) => node !== null)
      .map((node) => node as NodeWithScore);
    return this.responseSynthesizer.synthesize(query, nodes, parentEvent);
  }

  private async querySubQ(
    subQ: SubQuestion,
    parentEvent?: Event,
  ): Promise<NodeWithScore | null> {
    try {
      const question = subQ.subQuestion;
      const queryEngine = this.queryEngines[subQ.toolName];

      const response = await queryEngine.query(question, parentEvent);
      const responseText = response.response;
      const nodeText = `Sub question: ${question}\nResponse: ${responseText}`;
      const node = new TextNode({ text: nodeText });
      return { node, score: 0 };
    } catch (error) {
      return null;
    }
  }
}

//Implement Router Query Engine
export class RouterQueryEngine implements BaseQueryEngine {
  queryEngines: QueryEngineTool[];
  selector: BaseSelector;
  serviceContext: ServiceContext;
  metadata: ToolMetadata[];
  //Fix summarizer type later
  summarizer: any;

  constructor(queryEngines: QueryEngineTool[], selector: BaseSelector,
              summarizer?: any, serviceContext?: ServiceContext){
    this.queryEngines = queryEngines;
    this.selector = selector;
    this.metadata = queryEngines.map(engine => engine.metadata);
    this.serviceContext = serviceContext || serviceContextFromDefaults();
    this.summarizer = summarizer || new TreeSummarize(this.serviceContext);
  }
  async query(query: string): Promise<Response>{
    //Get selections
    const result: Selection[] = await this.selector.select(query, this.metadata);
    //Query each selected engine
    const responses: Response[] = [];
    result.map(async candidate => {
      const idx_to_query: number = candidate.answer;

      //A list's index starts at 1, so we need to correct for that.
      //An idx_to_query being 0 implies that no candidate query engine has been selected.
      if(idx_to_query != 0){
        console.log(`Querying QueryEngine#${idx_to_query} for this reason: ${candidate.reason}\n`);
        const entry: Response = await this.queryEngines[idx_to_query-1].queryEngine.query(query);
        responses.push(entry);
      }
    });

    //Synthesize each engine's output
    if(responses.length === 0){
      return new Response("No query engine was found to be relevant.");
    }
    const text_chunks: string[] = responses.map(response => response.response);
    const final_response = await this.summarizer.query(query, text_chunks);
    return final_response;
  };
}