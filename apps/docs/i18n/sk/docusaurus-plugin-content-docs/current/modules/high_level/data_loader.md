---
sidebar_position: 1
---

# Bralec / Nalagalnik

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

LlamaIndex.TS omogoča enostavno nalaganje datotek iz map s pomočjo razreda `SimpleDirectoryReader`. Trenutno so podprte datoteke `.txt`, `.pdf`, `.csv`, `.md` in `.docx`, v prihodnosti pa načrtujemo podporo za več formatov!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Referenca

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
