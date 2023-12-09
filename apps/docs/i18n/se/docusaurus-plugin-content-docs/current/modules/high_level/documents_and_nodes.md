---
sidebar_position: 0
---

# Dokumenti i čvorovi

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

`Dokumenti` i `Čvorovi` su osnovni građevinski blokovi svakog indeksa. Iako je API za ove objekte sličan, objekti `Dokumenta` predstavljaju kompletne datoteke, dok su `Čvorovi` manji delovi originalnog dokumenta, koji su pogodni za LLM i Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "tekst", metadata: { ključ: "vrednost" } });
```

## API Referenca

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
