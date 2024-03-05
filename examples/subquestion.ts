import {
  Document,
  QueryEngineTool,
  SubQuestionQueryEngine,
  VectorStoreIndex,
} from "llamaindex";

import essay from "./essay";

(async () => {
  const document = new Document({ text: essay, id_: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);

  const queryEngineTools = [
    new QueryEngineTool({
      queryEngine: index.asQueryEngine(),
      metadata: {
        name: "pg_essay",
        description: "Paul Graham essay on What I Worked On",
      },
    }),
  ];

  const queryEngine = SubQuestionQueryEngine.fromDefaults({
    queryEngineTools,
  });

  const response = await queryEngine.query({
    query: "How was Paul Grahams life different before and after YC?",
  });

  console.log(response.toString());
})();
