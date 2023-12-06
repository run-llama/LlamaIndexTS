---
sidebar_position: 3
---

# NodeParser (Анализатор на възли)

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

`NodeParser` в LlamaIndex е отговорен за разделянето на обекти от тип `Document` на по-лесни за управление обекти от тип `Node`. Когато извикате `.fromDocuments()`, `NodeParser` от `ServiceContext` се използва автоматично за това. Алтернативно, можете да го използвате, за да разделяте документи предварително.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Аз съм на 10 години. Джон е на 20 години." }),
]);
```

## TextSplitter (TextSplitter)

Основният разделящ текст ще раздели текста на изречения. Той може също да се използва като самостоятелен модул за разделяне на суров текст.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Здравей, свят");
```

## API Reference (API справка)

- [SimpleNodeParser (Прост анализатор на възли)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (Разделяне на изречения)](../../api/classes/SentenceSplitter.md)

"
