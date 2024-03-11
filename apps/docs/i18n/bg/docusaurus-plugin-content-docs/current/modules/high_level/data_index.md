---
sidebar_position: 2
---

# Индекс

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

Индексът е основният контейнер и организация за вашите данни. LlamaIndex.TS поддържа два вида индекси:

- `VectorStoreIndex` - ще изпраща най-добрите `Node` до LLM при генериране на отговор. По подразбиране, най-добрите два.
- `SummaryIndex` - ще изпраща всеки `Node` в индекса до LLM, за да генерира отговор.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "тест" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Референция

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
