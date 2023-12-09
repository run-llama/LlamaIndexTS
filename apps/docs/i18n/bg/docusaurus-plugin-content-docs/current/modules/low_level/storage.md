---
sidebar_position: 7
---

# Съхранение (Storage)

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

Съхранението в LlamaIndex.TS работи автоматично, след като сте конфигурирали обект `StorageContext`. Просто конфигурирайте `persistDir` и го свържете с индекс.

В момента се поддържа само запазване и зареждане от диск, с планирани бъдещи интеграции!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Тестов текст" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Референция

- [StorageContext](../../api/interfaces/StorageContext.md)

"
