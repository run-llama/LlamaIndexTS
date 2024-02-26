import {
  Document,
  FaithfulnessEvaluator,
  OpenAI,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  const llm = new OpenAI({
    model: "gpt-4",
  });

  const ctx = serviceContextFromDefaults({
    llm,
  });

  const evaluator = new FaithfulnessEvaluator({
    serviceContext: ctx,
  });

  const documents = [
    new Document({
      text: `The city came under British control in 1664 and was renamed New York after King Charles II of England granted the lands to his brother, the Duke of York. The city was regained by the Dutch in July 1673 and was renamed New Orange for one year and three months; the city has been continuously named New York since November 1674. New York City was the capital of the United States from 1785 until 1790, and has been the largest U.S. city since 1790. The Statue of Liberty greeted millions of immigrants as they came to the U.S. by ship in the late 19th and early 20th centuries, and is a symbol of the U.S. and its ideals of liberty and peace. In the 21st century, New York City has emerged as a global node of creativity, entrepreneurship, and as a symbol of freedom and cultural diversity. The New York Times has won the most Pulitzer Prizes for journalism and remains the U.S. media's "newspaper of record". In 2019, New York City was voted the greatest city in the world in a survey of over 30,000 p...	Pass`,
    }),
  ];

  const vectorIndex = await VectorStoreIndex.fromDocuments(documents);

  const queryEngine = vectorIndex.asQueryEngine();

  const query = "How did New York City get its name?";

  const response = await queryEngine.query({
    query,
  });

  const result = await evaluator.evaluateResponse({
    query,
    response,
  });

  console.log(result);
}

main();
