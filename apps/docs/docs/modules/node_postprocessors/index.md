# Node Postprocessors

## Concept

Node postprocessors are a set of modules that take a set of nodes, and apply some kind of transformation or filtering before returning them.

In LlamaIndex, node postprocessors are most commonly applied within a query engine, after the node retrieval step and before the response synthesis step.

LlamaIndex offers several node postprocessors for immediate use, while also providing a simple API for adding your own custom postprocessors.

## Usage Pattern

An example of using a node postprocessors is below:

```ts
import {
  Node,
  NodeWithScore,
  SimilarityPostprocessor,
  CohereRerank,
} from "llamaindex";

const nodes: NodeWithScore[] = [
  {
    node: new TextNode({ text: "hello world" }),
    score: 0.8,
  },
  {
    node: new TextNode({ text: "LlamaIndex is the best" }),
    score: 0.6,
  },
];

// similarity postprocessor: filter nodes below 0.75 similarity score
const processor = new SimilarityPostprocessor({
  similarityCutoff: 0.7,
});

const filteredNodes = processor.postprocessNodes(nodes);

// cohere rerank: rerank nodes given query using trained model
const reranker = new CohereRerank({
  apiKey: "<COHERE_API_KEY>",
  topN: 2,
});

const rerankedNodes = await reranker.postprocessNodes(nodes, "<user_query>");

console.log(filteredNodes, rerankedNodes);
```

Now you can use the `filteredNodes` and `rerankedNodes` in your application.

## Using Node Postprocessors in LlamaIndex

Most commonly, node-postprocessors will be used in a query engine, where they are applied to the nodes returned from a retriever, and before the response synthesis step.

### Using Node Postprocessors in a Query Engine

```ts
import { Node, NodeWithScore, SimilarityPostprocessor, CohereRerank } from "llamaindex";

const nodes: NodeWithScore[] = [
  {
    node: new TextNode({ text: "hello world" }),
    score: 0.8,
  },
  {
    node: new TextNode({ text: "LlamaIndex is the best" }),
    score: 0.6,
  }
];

// cohere rerank: rerank nodes given query using trained model
const reranker = new CohereRerank({
  apiKey: "<COHERE_API_KEY>,
  topN: 2,
})

const document = new Document({ text: "essay", id_: "essay" });

const serviceContext = serviceContextFromDefaults({
  llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 }),
});

const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});

const queryEngine = index.asQueryEngine({
  nodePostprocessors: [processor, reranker],
});

// all node post-processors will be applied during each query
const response = await queryEngine.query("<user_query>");
```

### Using with retrieved nodes

```ts
import { SimilarityPostprocessor } from "llamaindex";

nodes = await index.asRetriever().retrieve("test query str");

const processor = new SimilarityPostprocessor({
  similarityCutoff: 0.7,
});

const filteredNodes = processor.postprocessNodes(nodes);
```
