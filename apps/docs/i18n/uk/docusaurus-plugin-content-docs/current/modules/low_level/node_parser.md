---
sidebar_position: 3
---

# NodeParser (Парсер вузлів)

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

`NodeParser` в LlamaIndex відповідає за розбиття об'єктів `Document` на більш керовані об'єкти `Node`. Коли ви викликаєте `.fromDocuments()`, `NodeParser` з `ServiceContext` автоматично використовується для цього. Альтернативно, ви можете використовувати його для розбиття документів заздалегідь.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Мені 10 років. Джону 20 років." }),
]);
```

## TextSplitter (Розбірник тексту)

Основний розбірник тексту розбиватиме текст на речення. Його також можна використовувати як самостійний модуль для розбиття сирих текстів.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Привіт, світ");
```

"

## Довідник API

- [SimpleNodeParser (Простий парсер вузлів)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (Розбивач речень)](../../api/classes/SentenceSplitter.md)

"
