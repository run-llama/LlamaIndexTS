---
sidebar_position: 3
---

# Advanced Features

## Sub Question Query Engine

The basic concept of the Sub Question Query Engine is that it splits a single query into multiple queries, gets an answer for each of those queries, and then combines those different answers into a single coherent response for the user. You can think of it as the "think this through step by step" prompt technique but iterating over your data sources!

### Getting Started

The easiest way to start trying the Sub Question Query Engine is running the subquestion.ts file in apps/simple.

```bash
npx ts-node subquestion.ts
```

### Tools

SubQuestionQueryEngine is implemented with Tools. The basic idea of Tools is that they are executable options for the large language model. In this case, our SubQuestionQueryEngine relies on QueryEngineTool, which as you guessed it is a tool to run queries on a QueryEngine. This allows us to give the model an option to query different documents for different questions for example. You could also imagine that the SubQuestionQueryEngine could use a Tool that searches for something on the web or gets an answer using Wolfram Alpha.

You can learn more about Tools by taking a look at the LlamaIndex Python documentation https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html
