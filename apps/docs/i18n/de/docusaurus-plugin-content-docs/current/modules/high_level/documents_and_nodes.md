---
sidebar_position: 0
---

# Dokumente und Knoten

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

`Dokumente` und `Knoten` sind die grundlegenden Bausteine eines jeden Index. Obwohl die API für diese Objekte ähnlich ist, repräsentieren `Dokument`-Objekte ganze Dateien, während `Knoten` kleinere Teile des ursprünglichen Dokuments sind, die für eine LLM und Q&A geeignet sind.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "Text", metadata: { key: "val" } });
```

## API-Referenz

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
