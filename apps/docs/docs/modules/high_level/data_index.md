---
sidebar_position: 2
---

# Index

An index is the basic container and organization for your data. LlamaIndex.TS supports two indexes:

- `ListIndex` - will send every `Node` in the index to the LLM in order to generate a response
- `VectorStoreIndex` - will send the top-k `Node`s to the LLM when generating a response. The default top-k is 2.

```typescript
import {
  Document,
  VectorStoreIndex,
} from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments(
  [document]
);
```