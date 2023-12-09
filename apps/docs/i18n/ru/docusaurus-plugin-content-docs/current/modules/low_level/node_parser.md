---
sidebar_position: 3
---

# NodeParser (ПарсерУзлов)

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

`NodeParser` в LlamaIndex отвечает за разделение объектов `Document` на более управляемые объекты `Node`. Когда вы вызываете `.fromDocuments()`, `NodeParser` из `ServiceContext` автоматически выполняет это для вас. Кроме того, вы можете использовать его для предварительного разделения документов.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Мне 10 лет. Джону 20 лет." }),
]);
```

## TextSplitter (TextSplitter)

Базовый разделитель текста разделяет текст на предложения. Его также можно использовать как самостоятельный модуль для разделения необработанного текста.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Привет, мир");
```

## Справочник по API

- [SimpleNodeParser (ПростойПарсерУзлов)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (РазделительПредложений)](../../api/classes/SentenceSplitter.md)

"
