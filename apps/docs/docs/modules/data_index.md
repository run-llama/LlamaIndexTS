---
sidebar_position: 3
---

# Index

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
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
