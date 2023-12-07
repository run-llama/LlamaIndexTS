---
sidebar_position: 0
---

# Dokumenty a uzly

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

`Dokumenty` a `Uzly` jsou základní stavební kameny každého indexu. Zatímco API pro tyto objekty je podobné, objekty `Dokument` představují celé soubory, zatímco `Uzly` jsou menší části tohoto původního dokumentu, které jsou vhodné pro LLM a Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## API Reference

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
