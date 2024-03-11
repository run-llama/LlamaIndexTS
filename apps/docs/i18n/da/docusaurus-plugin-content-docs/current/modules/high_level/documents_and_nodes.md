---
sidebar_position: 0
---

# Dokumenter og Noder

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

`Dokumenter` og `Noder` er de grundlæggende byggeklodser i enhver indeks. Selvom API'en for disse objekter er ens, repræsenterer `Dokument` objekter hele filer, mens `Noder` er mindre dele af det oprindelige dokument, der er velegnede til LLM og Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "tekst", metadata: { nøgle: "værdi" } });
```

## API Reference

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
