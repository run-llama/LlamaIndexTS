// from llama_index import SimpleDirectoryReader, VectorStoreIndex
// from llama_index.query_engine import SubQuestionQueryEngine
// from llama_index.tools import QueryEngineTool, ToolMetadata

// # load data
// pg_essay = SimpleDirectoryReader(
//     input_dir="docs/examples/data/paul_graham/"
// ).load_data()

// # build index and query engine
// query_engine = VectorStoreIndex.from_documents(pg_essay).as_query_engine()

// # setup base query engine as tool
// query_engine_tools = [
//     QueryEngineTool(
//         query_engine=query_engine,
//         metadata=ToolMetadata(
//             name="pg_essay", description="Paul Graham essay on What I Worked On"
//         ),
//     )
// ]

// query_engine = SubQuestionQueryEngine.from_defaults(
//     query_engine_tools=query_engine_tools
// )

// response = query_engine.query(
//     "How was Paul Grahams life different before and after YC?"
// )

// print(response)

import { Document } from "@llamaindex/core/src/Node";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import { SubQuestionQueryEngine } from "@llamaindex/core/src/QueryEngine";

import essay from "./essay";

(async () => {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);

  const queryEngine = SubQuestionQueryEngine.fromDefaults({
    queryEngineTools: [
      {
        queryEngine: index.asQueryEngine(),
        metadata: {
          name: "pg_essay",
          description: "Paul Graham essay on What I Worked On",
        },
      },
    ],
  });

  const response = await queryEngine.aquery(
    "How was Paul Grahams life different before and after YC?"
  );

  console.log(response);
})();
