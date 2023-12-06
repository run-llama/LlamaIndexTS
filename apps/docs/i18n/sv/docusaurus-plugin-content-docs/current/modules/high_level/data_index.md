---
sidebar_position: 2
---

# Index

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

En index är den grundläggande behållaren och organisationen för dina data. LlamaIndex.TS stöder två index:

- `VectorStoreIndex` - kommer att skicka de bästa-k `Node` till LLM när en respons genereras. Standardvärdet för bästa-k är 2.
- `SummaryIndex` - kommer att skicka varje `Node` i indexet till LLM för att generera en respons.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Referens

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
