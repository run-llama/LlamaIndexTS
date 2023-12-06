---
sidebar_position: 0
---

# Documenten en Nodes

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

`Documenten` en `Nodes` zijn de basisbouwstenen van elke index. Hoewel de API voor deze objecten vergelijkbaar is, vertegenwoordigen `Documenten` objecten volledige bestanden, terwijl `Nodes` kleinere delen zijn van dat oorspronkelijke document, die geschikt zijn voor een LLM en Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "tekst", metadata: { key: "val" } });
```

## API Referentie

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
