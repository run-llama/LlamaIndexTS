import { Document, TextNode, NodeWithScore } from "@llamaindex/core/src/Node";
import { ResponseSynthesizer } from "@llamaindex/core/src/ResponseSynthesizer";
import { SimpleNodeParser } from "@llamaindex/core/src/NodeParser";

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

  const response = await responseSynthesizer.asynthesize(
    "What age am I?",
    nodesWithScore
  );
  console.log(response.response);
})();
