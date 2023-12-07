---
sidebar_position: 7
---

# Зберігання (Storage)

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Зберігання в LlamaIndex.TS працює автоматично після налаштування об'єкта `StorageContext`. Просто налаштуйте `persistDir` і прикріпіть його до індексу.

Наразі підтримується лише збереження та завантаження з диска, з планами на майбутні інтеграції!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Тестовий текст" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Довідник по API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
