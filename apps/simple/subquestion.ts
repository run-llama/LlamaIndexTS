import { Document, VectorStoreIndex, SubQuestionQueryEngine } from "llamaindex";

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

  const response = await queryEngine.query(
    "How was Paul Grahams life different before and after YC?"
  );

  console.log(response);
})();
