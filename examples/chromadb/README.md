# Chroma Vector Store Example

This sample loads the same dataset of movie reviews from csv file. Then it uses the Chroma Vector Store to save the embedding vectors and test query the data.

## Prerequisites

Setup OpenAI API Key:

```bash
export OPENAI_API_KEY=your_key
```

## Test Loading Docs and Querying

Read and follow the instructions in the README.md file located one directory up to make sure your JS/TS dependencies are set up. The commands listed below are also run from that parent directory.

To test import documents, save the embedding vectors and query, run the following command:

> `npx ts-node chromadb/test.ts`
