---
sidebar_position: 0
---

# Dokumenty a uzly

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

`Dokumenty` a `Uzly` sú základné stavebné bloky každého indexu. Zatiaľ čo API pre tieto objekty je podobné, objekty `Dokument` predstavujú celé súbory, zatiaľ čo `Uzly` sú menšie časti tohto pôvodného dokumentu, ktoré sú vhodné pre LLM a Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## API Referencia

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
