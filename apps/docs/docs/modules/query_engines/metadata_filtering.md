# Metadata Filtering

Metadata filtering is a way to filter the documents that are returned by a query based on the metadata associated with the documents. This is useful when you want to filter the documents based on some metadata that is not part of the document text.

You can also check our multi-tenancy blog post to see how metadata filtering can be used in a multi-tenant environment. [https://blog.llamaindex.ai/building-multi-tenancy-rag-system-with-llamaindex-0d6ab4e0c44b] (the article uses the Python version of LlamaIndex, but the concepts are the same).

## Setup

Firstly if you haven't already, you need to install the `llamaindex` package:

```bash
pnpm i llamaindex
```

Then you can import the necessary modules from `llamaindex`:

```ts
import {
  ChromaVectorStore,
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

const collectionName = "dog_colors";
```

## Creating documents with metadata

You can create documents with metadata using the `Document` class:

```ts
const docs = [
  new Document({
    text: "The dog is brown",
    metadata: {
      color: "brown",
      dogId: "1",
    },
  }),
  new Document({
    text: "The dog is red",
    metadata: {
      color: "red",
      dogId: "2",
    },
  }),
];
```

## Creating a ChromaDB vector store

You can create a `ChromaVectorStore` to store the documents:

```ts
const chromaVS = new ChromaVectorStore({ collectionName });
const serviceContext = await storageContextFromDefaults({
  vectorStore: chromaVS,
});

const index = await VectorStoreIndex.fromDocuments(docs, {
  storageContext: serviceContext,
});
```

## Querying the index with metadata filtering

Now you can query the index with metadata filtering using the `preFilters` option:

```ts
const queryEngine = index.asQueryEngine({
  preFilters: {
    filters: [
      {
        key: "dogId",
        value: "2",
        filterType: "ExactMatch",
      },
    ],
  },
});

const response = await queryEngine.query({
  query: "What is the color of the dog?",
});

console.log(response.toString());
```

## Full Code

```ts
import {
  ChromaVectorStore,
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

const collectionName = "dog_colors";

async function main() {
  try {
    const docs = [
      new Document({
        text: "The dog is brown",
        metadata: {
          color: "brown",
          dogId: "1",
        },
      }),
      new Document({
        text: "The dog is red",
        metadata: {
          color: "red",
          dogId: "2",
        },
      }),
    ];

    console.log("Creating ChromaDB vector store");
    const chromaVS = new ChromaVectorStore({ collectionName });
    const ctx = await storageContextFromDefaults({ vectorStore: chromaVS });

    console.log("Embedding documents and adding to index");
    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });

    console.log("Querying index");
    const queryEngine = index.asQueryEngine({
      preFilters: {
        filters: [
          {
            key: "dogId",
            value: "2",
            filterType: "ExactMatch",
          },
        ],
      },
    });
    const response = await queryEngine.query({
      query: "What is the color of the dog?",
    });
    console.log(response.toString());
  } catch (e) {
    console.error(e);
  }
}

main();
```
