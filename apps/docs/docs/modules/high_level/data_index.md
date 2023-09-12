---
sidebar_position: 2
---

# VectorStoreIndex

The `VectorStoreIndex` is an index that stores the nodes only according to their vector embeddings. It extends the `BaseIndex` class and overrides its methods to provide functionality specific to vector storage.

## Constructor

The `VectorStoreIndex` class has a private constructor that takes an object of type `VectorIndexConstructorProps` as its argument. This object should contain a `vectorStore` property, which is an instance of the `VectorStore` class.

## Methods

The `VectorStoreIndex` class has an `init` method that should be called after the constructor. This method is asynchronous and returns a promise that resolves to an instance of the `VectorStoreIndex` class. The `init` method takes an object of type `VectorIndexOptions` as its argument.

## Properties

The `VectorStoreIndex` class has a `vectorStore` property, which is an instance of the `VectorStore` class.
An index is the basic container and organization for your data. LlamaIndex.TS supports two indexes:

- `VectorStoreIndex` - will send the top-k `Node`s to the LLM when generating a response. The default top-k is 2.
- `SummaryIndex` - will send every `Node` in the index to the LLM in order to generate a response

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Reference

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/core.indices.vectorStore.VectorStoreIndex.md)
