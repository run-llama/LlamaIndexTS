---
sidebar_position: 3
---

# NodeParser

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

`NodeParser` LlamaIndexis on vastutav `Document` objektide jagamise eest hõlpsamini hallatavateks `Node` objektideks. Kui kutsute `.fromDocuments()` meetodit, kasutatakse `ServiceContext`-i `NodeParser`-it selle automaatseks tegemiseks. Võite seda ka kasutada dokumentide ette jagamiseks.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Olen 10-aastane. John on 20-aastane." }),
]);
```

## TextSplitter

Aluseks olev teksti jagaja jagab teksti lauseteks. Seda saab kasutada ka iseseisva moodulina toore teksti jagamiseks.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Tere maailm");
```

"

## API viide

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
