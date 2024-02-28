// class BaseSQLTableQueryEngine(BaseQueryEngine):
//     def __init__(
//         self,
//         synthesize_response: bool = True,
//         response_synthesis_prompt: Optional[BasePromptTemplate] = None,
//         service_context: Optional[ServiceContext] = None,
//         verbose: bool = False,
//         **kwargs: Any,
//     ) -> None:
//         """Initialize params."""
//         self._service_context = service_context or ServiceContext.from_defaults()
//         self._response_synthesis_prompt = (
//             response_synthesis_prompt or DEFAULT_RESPONSE_SYNTHESIS_PROMPT_V2
//         )
//         # do some basic prompt validation
//         _validate_prompt(self._response_synthesis_prompt)
//         self._synthesize_response = synthesize_response
//         self._verbose = verbose
//         super().__init__(self._service_context.callback_manager, **kwargs)

import { Response } from "../../../Response.js";
import { serviceContextFromDefaults, type ServiceContext } from "../../../ServiceContext.js";
import { CompactAndRefine, ResponseSynthesizer } from "../../../index.js";
import type { BaseQueryEngine, QueryEngineParamsNonStreaming, QueryEngineParamsStreaming } from "../../../types.js";

//     def _get_prompts(self) -> Dict[str, Any]:
//         """Get prompts."""
//         return {"response_synthesis_prompt": self._response_synthesis_prompt}

//     def _update_prompts(self, prompts: PromptDictType) -> None:
//         """Update prompts."""
//         if "response_synthesis_prompt" in prompts:
//             self._response_synthesis_prompt = prompts["response_synthesis_prompt"]

//     def _get_prompt_modules(self) -> PromptMixinType:
//         """Get prompt modules."""
//         return {"sql_retriever": self.sql_retriever}

//     @property
//     @abstractmethod
//     def sql_retriever(self) -> NLSQLRetriever:
//         """Get SQL retriever."""

//     @property
//     def service_context(self) -> ServiceContext:
//         """Get service context."""
//         return self._service_context

//     def _query(self, query_bundle: QueryBundle) -> Response:
//         """Answer a query."""
//         retrieved_nodes, metadata = self.sql_retriever.retrieve_with_metadata(
//             query_bundle
//         )

//         sql_query_str = metadata["sql_query"]
//         if self._synthesize_response:
//             partial_synthesis_prompt = self._response_synthesis_prompt.partial_format(
//                 sql_query=sql_query_str,
//             )
//             response_synthesizer = get_response_synthesizer(
//                 service_context=self._service_context,
//                 callback_manager=self._service_context.callback_manager,
//                 text_qa_template=partial_synthesis_prompt,
//                 verbose=self._verbose,
//             )
//             response = response_synthesizer.synthesize(
//                 query=query_bundle.query_str,
//                 nodes=retrieved_nodes,
//             )
//             cast(Dict, response.metadata).update(metadata)
//             return cast(Response, response)
//         else:
//             response_str = "\n".join([node.node.text for node in retrieved_nodes])
//             return Response(response=response_str, metadata=metadata)

//     async def _aquery(self, query_bundle: QueryBundle) -> Response:
//         """Answer a query."""
//         retrieved_nodes, metadata = await self.sql_retriever.aretrieve_with_metadata(
//             query_bundle
//         )

//         sql_query_str = metadata["sql_query"]
//         if self._synthesize_response:
//             partial_synthesis_prompt = self._response_synthesis_prompt.partial_format(
//                 sql_query=sql_query_str,
//             )
//             response_synthesizer = get_response_synthesizer(
//                 service_context=self._service_context,
//                 callback_manager=self._service_context.callback_manager,
//                 text_qa_template=partial_synthesis_prompt,
//             )
//             response = await response_synthesizer.asynthesize(
//                 query=query_bundle.query_str,
//                 nodes=retrieved_nodes,
//             )
//             cast(Dict, response.metadata).update(metadata)
//             return cast(Response, response)
//         else:
//             response_str = "\n".join([node.node.text for node in retrieved_nodes])
//             return Response(response=response_str, metadata=metadata)

abstract class BaseSQLTableQueryEngine implements BaseQueryEngine {
  synthesizeResponse: boolean;
  responseSynthesisPrompt: BasePromptTemplate;
  serviceContext: ServiceContext;
  verbose: boolean;

  constructor(init: {
    synthesizeResponse?: boolean;
    responseSynthesisPrompt?: BasePromptTemplate;
    serviceContext?: ServiceContext;
    verbose?: boolean;
  }) {
    this.synthesizeResponse = init.synthesizeResponse || true;
    this.responseSynthesisPrompt = init.responseSynthesisPrompt || DEFAULT_RESPONSE_SYNTHESIS_PROMPT_V2;
    this.serviceContext = init.serviceContext || serviceContextFromDefaults({})
    this.verbose = init.verbose || false;
    this.sqlRetriever = init.sqlRetriever;
  }

  getPrompts(): Record<string, any> {
    return { responseSynthesisPrompt: this.responseSynthesisPrompt };
  }

  updatePrompts(prompts: Record<string, any>): void {
    if ("responseSynthesisPrompt" in prompts) {
      this.responseSynthesisPrompt = prompts.responseSynthesisPrompt;
    }
  }

  getPromptModules(): Record<string, any> {
    return { sqlRetriever: this.sqlRetriever };
  }

  abstract get sqlRetriever();

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;

    if (stream) {
      throw new Error("Streaming is not supported");
    }

    const retrievedNodes = this.sqlRetriever.retrieve(query);

    const sqlQueryStr = retrievedNodes.metadata.sqlQuery;
    if (this.synthesizeResponse) {
      const partialSynthesisPrompt = this.responseSynthesisPrompt.partialFormat({
        sqlQuery: sqlQueryStr,
      });

      const responseSynthesizer = new ResponseSynthesizer({
        serviceContext: this.serviceContext,
        responseBuilder: new CompactAndRefine(
          this.serviceContext,
          this.responseSynthesisPrompt
        ),
      })

      const response = responseSynthesizer.synthesize({
        query,
        nodes: retrievedNodes,
      });
      (response.metadata as Record<string, any>).sqlQuery = sqlQueryStr;
      return response;
    }

    const responseStr = retrievedNodes.map((node) => node.node.text).join("\n");

    return new Response(responseStr, []);
  }
}