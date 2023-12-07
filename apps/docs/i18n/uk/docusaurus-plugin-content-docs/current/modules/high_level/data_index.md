---
sidebar_position: 2
---

# Індекс

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Індекс - це основний контейнер і організація для ваших даних. LlamaIndex.TS підтримує два типи індексів:

- `VectorStoreIndex` - надсилає топ-k `Node` до LLM при генерації відповіді. За замовчуванням, top-k дорівнює 2.
- `SummaryIndex` - надсилає кожен `Node` в індексі до LLM для генерації відповіді.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "тест" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Довідник по API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
