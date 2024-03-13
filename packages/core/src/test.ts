import { ChatPromptTemplate, Document, PromptTemplate, VectorStoreIndex, messagesToPrompt, type ChatMessage } from "./index.js"

import mustache from "mustache";


// "Context information is below.\n"
// "---------------------\n"
// "{context_str}\n"
// "---------------------\n"
// "Given the context information and not prior knowledge, "
// "answer the query.\n"
// "Query: {query_str}\n"
// "Answer: "

const textQaPromptFunction =  () => `Context information is below.
---------------------
{{context}}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: {{query}}
Answer:`

// const textQaPromptFunction = ({ context, query }: {
//   context: string,
//   query: string
// }) => `Context information is below.
// ---------------------
// {{context}}
// ---------------------
// Given the context information and not prior knowledge, answer the query.
// Query: {{query}}
// Answer: `

// const textQaPrompt = `Context information is below.
// ---------------------
// {{context}}
// ---------------------
// Given the context information and not prior knowledge, answer the query.
// Query: {{query}}
// Answer: `

// Serialize the function dynamically

async function main() {
  // const message = new PromptTemplate(
  //   textQaPromptFunction,
  //   {
  //     context: "This is the context",
  //     query: "This is the query"
  //   }
  // )

  const messages: ChatMessage[] = [
    {
      content: "This is the context",
      role: "system"
    },
    {
      content: "This is the query",
      role: "user"
    }
  ]

  const chatMessageTemplate = new ChatPromptTemplate(() => messages, {})

  // const newPrompt = new PromptTemplate(() => `
  //   stop
  //   {{context}}
  //   hey
  //   {{query}}
  // `, {})

  const documents = [
    new Document({ text: "An example of the context" }),
  ]

  const index = await VectorStoreIndex.fromDocuments(documents)

  const queryEngine = index.asQueryEngine()

  queryEngine.updatePrompts({
    "responseSynthesizer:textQATemplate": chatMessageTemplate
  })

  const query = "What is the answer to the question?"

  const response = await queryEngine.query({
    query
  })
  
  console.log({
    response
  })
}

main()
