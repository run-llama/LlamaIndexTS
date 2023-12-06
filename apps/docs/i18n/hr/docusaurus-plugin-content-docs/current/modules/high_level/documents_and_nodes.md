---
sidebar_position: 0
---

# Dokumenti i Čvorovi

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

`Dokumenti` i `Čvorovi` su osnovni građevni blokovi svakog indeksa. Iako je API za ove objekte sličan, objekti `Dokumenta` predstavljaju cijele datoteke, dok su `Čvorovi` manji dijelovi tog originalnog dokumenta, koji su prikladni za LLM i Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "tekst", metadata: { ključ: "vrijednost" } });
```

## API Referenca

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
