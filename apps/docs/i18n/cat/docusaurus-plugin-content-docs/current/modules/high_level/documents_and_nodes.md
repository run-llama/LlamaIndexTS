---
sidebar_position: 0
---

# Documents i Nodes

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

Els `Document`s i els `Node`s són els blocs de construcció bàsics de qualsevol índex. Tot i que l'API per a aquests objectes és similar, els objectes `Document` representen fitxers sencers, mentre que els `Node`s són peces més petites d'aquest document original, que són adequades per a un LLM i una Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## Referència de l'API

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
