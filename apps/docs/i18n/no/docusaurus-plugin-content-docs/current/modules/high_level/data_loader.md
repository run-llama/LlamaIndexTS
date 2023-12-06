---
sidebar_position: 1
---

# Leser / Laster

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

LlamaIndex.TS støtter enkel lasting av filer fra mapper ved hjelp av klassen `SimpleDirectoryReader`. For øyeblikket støttes `.txt`, `.pdf`, `.csv`, `.md` og `.docx` filer, med flere planlagt i fremtiden!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API-referanse

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
