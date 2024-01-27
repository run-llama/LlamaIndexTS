---
sidebar_position: 4
---

# QueryEngine

A query engine wraps a `Retriever` and a `ResponseSynthesizer` into a pipeline, that will use the query string to fetech nodes and then send them to the LLM to generate a response.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query({ query: "query string" });
```

The `query` function also supports streaming, just add `stream: true` as an option:

```typescript
const stream = await queryEngine.query({ query: "query string", stream: true });
for await (const chunk of stream) {
  process.stdout.write(chunk.response);
}
```

## Sub Question Query Engine

The basic concept of the Sub Question Query Engine is that it splits a single query into multiple queries, gets an answer for each of those queries, and then combines those different answers into a single coherent response for the user. You can think of it as the "think this through step by step" prompt technique but iterating over your data sources!

### Getting Started

The easiest way to start trying the Sub Question Query Engine is running the subquestion.ts file in [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Tools

SubQuestionQueryEngine is implemented with Tools. The basic idea of Tools is that they are executable options for the large language model. In this case, our SubQuestionQueryEngine relies on QueryEngineTool, which as you guessed it is a tool to run queries on a QueryEngine. This allows us to give the model an option to query different documents for different questions for example. You could also imagine that the SubQuestionQueryEngine could use a Tool that searches for something on the web or gets an answer using Wolfram Alpha.

You can learn more about Tools by taking a look at the LlamaIndex Python documentation https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API Reference

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
