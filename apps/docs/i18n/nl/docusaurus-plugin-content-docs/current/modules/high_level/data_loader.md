---
sidebar_position: 1
---

# Lezer / Loader

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

LlamaIndex.TS ondersteunt het eenvoudig laden van bestanden uit mappen met behulp van de `SimpleDirectoryReader` klasse. Momenteel worden `.txt`, `.pdf`, `.csv`, `.md` en `.docx` bestanden ondersteund, met meer gepland voor de toekomst!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documenten = new SimpleDirectoryReader().loadData("./data");
```

## API Referentie

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
