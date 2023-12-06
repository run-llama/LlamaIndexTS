---
sidebar_position: 2
---

# Индекс

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

Индекс - это основной контейнер и организация для ваших данных. LlamaIndex.TS поддерживает два типа индексов:

- `VectorStoreIndex` - отправляет лучшие `Node` в LLM при генерации ответа. Значение top-k по умолчанию равно 2.
- `SummaryIndex` - отправляет каждый `Node` в индексе в LLM для генерации ответа.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "тест" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Справочник по API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
