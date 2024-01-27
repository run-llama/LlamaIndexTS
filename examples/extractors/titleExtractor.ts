import { Document, OpenAI, SimpleNodeParser, TitleExtractor } from "llamaindex";

(async () => {
  const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

  const nodeParser = new SimpleNodeParser();

  const nodes = nodeParser.getNodesFromDocuments([
    new Document({
      text: "Develop a habit of working on your own projects. Don't let work mean something other people tell you to do. If you do manage to do great work one day, it will probably be on a project of your own. It may be within some bigger project, but you'll be driving your part of it.",
    }),
  ]);

  const titleExtractor = new TitleExtractor({
    llm: openaiLLM,
    nodes: 5,
  });

  const nodesWithTitledMetadata = await titleExtractor.processNodes(nodes);

  process.stdout.write(JSON.stringify(nodesWithTitledMetadata, null, 2));
})();
