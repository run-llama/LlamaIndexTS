---
sidebar_position: 0
---

# Dokumenter og Noder

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

`Dokumenter` og `Noder` er de grunnleggende byggeklossene i ethvert indeks. Selv om API-et for disse objektene er likt, representerer `Dokument`-objekter hele filer, mens `Noder` er mindre deler av det opprinnelige dokumentet som er egnet for LLM og Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "tekst", metadata: { nøkkel: "verdi" } });
```

## API-referanse

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
