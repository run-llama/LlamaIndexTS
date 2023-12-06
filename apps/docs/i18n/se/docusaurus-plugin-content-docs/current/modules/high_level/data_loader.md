---
sidebar_position: 1
---

# Čitač / Učitavač

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

LlamaIndex.TS podržava jednostavno učitavanje datoteka iz foldera koristeći klasu `SimpleDirectoryReader`. Trenutno se podržavaju `.txt`, `.pdf`, `.csv`, `.md` i `.docx` datoteke, a u budućnosti se planira podrška za još više formata!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Referenca

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
