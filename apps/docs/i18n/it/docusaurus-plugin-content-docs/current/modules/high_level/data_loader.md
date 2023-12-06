---
sidebar_position: 1
---

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

# Lettore / Caricatore

LlamaIndex.TS supporta il caricamento semplice di file da cartelle utilizzando la classe `SimpleDirectoryReader`. Attualmente, sono supportati i file `.txt`, `.pdf`, `.csv`, `.md` e `.docx`, con ulteriori pianificati per il futuro!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Riferimento API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
