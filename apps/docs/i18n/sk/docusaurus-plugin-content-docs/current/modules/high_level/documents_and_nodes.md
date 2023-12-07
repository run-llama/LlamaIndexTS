---
sidebar_position: 0
---

# Dokumenti in vozlišča

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

`Dokumenti` in `vozlišča` so osnovni gradniki vsakega indeksa. Čeprav je API za te objekte podoben, objekti `Dokument` predstavljajo celotne datoteke, medtem ko so `vozlišča` manjši deli tega izvirnega dokumenta, primerni za LLM in Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "besedilo", metadata: { ključ: "vrednost" } });
```

## API Referenca

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
