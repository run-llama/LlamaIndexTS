---
sidebar_position: 1
---

# Читач / Завантажувач

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

LlamaIndex.TS підтримує просте завантаження файлів з папок за допомогою класу `SimpleDirectoryReader`. Наразі підтримуються файли з розширеннями `.txt`, `.pdf`, `.csv`, `.md` та `.docx`, а в майбутньому планується підтримка ще більшої кількості форматів!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Довідник API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
