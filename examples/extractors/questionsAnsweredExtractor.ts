import {
  Document,
  OpenAI,
  QuestionsAnsweredExtractor,
  SimpleNodeParser,
} from "llamaindex";

(async () => {
  const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

  const nodeParser = new SimpleNodeParser();

  const nodes = nodeParser.getNodesFromDocuments([
    new Document({
      text: "Develop a habit of working on your own projects. Don't let work mean something other people tell you to do. If you do manage to do great work one day, it will probably be on a project of your own. It may be within some bigger project, but you'll be driving your part of it.",
    }),
    new Document({
      text: "The best way to get a good idea is to get a lot of ideas. The best way to get a lot of ideas is to get a lot of bad ideas. The best way to get a lot of bad ideas is to get a lot of ideas.",
    }),
  ]);

  const questionsAnsweredExtractor = new QuestionsAnsweredExtractor({
    llm: openaiLLM,
    questions: 5,
  });

  const nodesWithQuestionsMetadata =
    await questionsAnsweredExtractor.processNodes(nodes);

  process.stdout.write(JSON.stringify(nodesWithQuestionsMetadata, null, 2));
})();
