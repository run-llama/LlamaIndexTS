---
sidebar_position: 3
---

# NodeParser

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

`NodeParser` LlamaIndexissä on vastuussa `Document`-objektien jakamisesta hallittavampiin `Node`-objekteihin. Kun kutsut `.fromDocuments()`, `ServiceContext`-ista käytetään `NodeParser`-objektia, joka tekee tämän automaattisesti puolestasi. Vaihtoehtoisesti voit käyttää sitä dokumenttien jakamiseen etukäteen.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Olen 10-vuotias. John on 20-vuotias." }),
]);
```

## TextSplitter

Taustalla oleva tekstijakaja jakaa tekstin lauseisiin. Sitä voidaan myös käyttää itsenäisenä moduulina raakatekstin jakamiseen.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hei maailma");
```

## API-viite

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
