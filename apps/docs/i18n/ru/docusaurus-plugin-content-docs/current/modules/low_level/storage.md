---
sidebar_position: 7
---

# Хранилище (Storage)

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

Хранилище в LlamaIndex.TS работает автоматически после настройки объекта `StorageContext`. Просто настройте `persistDir` и присоедините его к индексу.

В настоящее время поддерживается только сохранение и загрузка с диска, с планируемыми будущими интеграциями!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Тестовый текст" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Справочник по API

- [StorageContext](../../api/interfaces/StorageContext.md)
