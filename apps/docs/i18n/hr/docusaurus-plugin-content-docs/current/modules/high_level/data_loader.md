---
sidebar_position: 1
---

# Čitač / Učitač

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

LlamaIndex.TS podržava jednostavno učitavanje datoteka iz mapa koristeći klasu `SimpleDirectoryReader`. Trenutno se podržavaju datoteke `.txt`, `.pdf`, `.csv`, `.md` i `.docx`, a u budućnosti se planira podrška za još više formata!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Referenca

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
