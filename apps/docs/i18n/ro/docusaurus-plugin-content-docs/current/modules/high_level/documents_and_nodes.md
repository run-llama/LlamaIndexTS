---
sidebar_position: 0
---

# Documente și Noduri

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

`Documentele` și `Nodurile` sunt elementele de bază ale oricărui index. În timp ce API-ul pentru aceste obiecte este similar, obiectele `Document` reprezintă fișiere întregi, în timp ce `Nodurile` sunt bucăți mai mici ale acelui document original, care sunt potrivite pentru un LLM și Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## Referință API

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
