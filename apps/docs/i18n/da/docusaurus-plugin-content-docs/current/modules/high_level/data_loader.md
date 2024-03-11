---
sidebar_position: 1
---

# Læser / Loader

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

LlamaIndex.TS understøtter nem indlæsning af filer fra mapper ved hjælp af klassen `SimpleDirectoryReader`. I øjeblikket understøttes `.txt`, `.pdf`, `.csv`, `.md` og `.docx` filer, med flere planlagt i fremtiden!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Reference

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
