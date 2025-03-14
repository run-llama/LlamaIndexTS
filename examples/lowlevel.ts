import {
  Document,
  getResponseSynthesizer,
  NodeWithScore,
  SentenceSplitter,
  TextNode,
} from "llamaindex";

(async () => {
  const nodeParser = new SentenceSplitter();
  const nodes = nodeParser.getNodesFromDocuments([
    new Document({ text: "I am 10 years old. John is 20 years old." }),
  ]);

  console.log(nodes);

  const responseSynthesizer = getResponseSynthesizer("compact");

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

  const stream = await responseSynthesizer.synthesize(
    {
      query: "What age am I?",
      nodes: nodesWithScore,
    },
    true,
  );
  for await (const chunk of stream) {
    process.stdout.write(chunk.response);
  }
})();
