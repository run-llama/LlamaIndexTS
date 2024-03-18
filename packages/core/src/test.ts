import {
  ChatPromptTemplate,
  PromptTemplate,
  SimpleDirectoryReader,
  VectorStoreIndex,
  type ChatMessage,
} from "./index.js";

// Define a default prompt template
const defaultTextQaPromptTemplate = () => `Context information is below.
---------------------
{{context}}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: {{query}}
Answer:`;

// Define a default chat prompt template
const defaultChatPromtTemplate = (): ChatMessage[] => [
  {
    content: "Always answer the question, even if you don't know the answer.",
    role: "system",
  },
  {
    content: defaultTextQaPromptTemplate(),
    role: "user",
  },
];

// Instantiate the prompt templates
const textQaPromptTemplate = new PromptTemplate(defaultTextQaPromptTemplate);
const chatMessageTemplate = new ChatPromptTemplate(defaultChatPromtTemplate);

// Map the template variables (get from the prompt templates all text that includes {{text}})
console.log({
  textQaVars: textQaPromptTemplate.mapTemplateVars(),
  chatTemplateVars: chatMessageTemplate.mapTemplateVars(),
});

async function main() {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "../examples",
  });

  const index = await VectorStoreIndex.fromDocuments(documents);

  const retriever = await index.asRetriever({});
  retriever.similarityTopK = 10;

  const queryEngine = index.asQueryEngine({
    retriever,
  });

  // Update the prompts
  queryEngine.updatePrompts({
    "responseSynthesizer:textQATemplate": chatMessageTemplate,
  });

  // Query the engine
  const query = "Tell me about abramov";

  const response = await queryEngine.query({
    query,
  });

  console.log({
    response,
  });
}

main();
