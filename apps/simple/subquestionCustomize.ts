

import { Document } from "@llamaindex/core/src/Node";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import { SubQuestionQueryEngine } from "@llamaindex/core/src/QueryEngine";

import essay from "./essay";
import { LLMQuestionGenerator } from "@llamaindex/core/src/QuestionGenerator";
import { defaultSubQuestionPrompt } from "@llamaindex/core/src/Prompt";
import { Refine, ResponseSynthesizer } from "@llamaindex/core/src/ResponseSynthesizer";
import { serviceContextFromDefaults } from "@llamaindex/core/src/ServiceContext";

// Customize the prompt for the question generator
async function main() {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);

  
  // TODO: hard to modify the existing prompts since it's a function
  const questionGen = new LLMQuestionGenerator({
    prompt : defaultSubQuestionPrompt,
  });

  const serviceContext = serviceContextFromDefaults();

  const builder = new Refine(serviceContext);
  const synthesizer = new ResponseSynthesizer(builder);

  const queryEngine = SubQuestionQueryEngine.fromDefaults({
    questionGen: questionGen,
    responseSynthesizer: synthesizer,
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
}

main().catch(console.error);