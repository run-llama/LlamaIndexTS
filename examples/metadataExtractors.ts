import {
  Document,
  KeywordExtractor,
  OpenAI,
  SimpleNodeParser,
} from "llamaindex";

(async () => {
  const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

  const nodeParser = new SimpleNodeParser();

  const nodes = nodeParser.getNodesFromDocuments([
    new Document({ text: "banana apple orange pear peach watermelon" }),
  ]);

  console.log(nodes);

  const keywordExtractor = new KeywordExtractor(openaiLLM, 5);

  const nodesWithKeywordMetadata = await keywordExtractor.processNodes(nodes);

  process.stdout.write(JSON.stringify(nodesWithKeywordMetadata, null, 2));
})();
