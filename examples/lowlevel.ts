import {
  Document,
  NodeWithScore,
  ResponseSynthesizer,
  SimpleNodeParser,
  TextNode,
} from "llamaindex";

(async () => {
  const nodeParser = new SimpleNodeParser();
  const nodes = nodeParser.getNodesFromDocuments([
    new Document({ text: "I am 10 years old. John is 20 years old." }),
  ]);

  console.log(nodes);

  const responseSynthesizer = new ResponseSynthesizer();

  const nodesWithScore: NodeWithScore[] = [
    {
      node: new TextNode({ text: "I am 10 years old." }),
      score: 1,
    },
    {
      node: new TextNode({ text: "John is 20 years old." }),
      score: 0.5,
    },
  ];

  const stream = await responseSynthesizer.synthesize({
    query: "What age am I?",
    nodesWithScore,
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.response);
  }
})();
