---
sidebar_position: 1
---

# Čtenář / Načítání

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

LlamaIndex.TS podporuje snadné načítání souborů z adresářů pomocí třídy `SimpleDirectoryReader`. V současné době jsou podporovány soubory `.txt`, `.pdf`, `.csv`, `.md` a `.docx`, s plánem na podporu dalších typů souborů v budoucnosti!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Reference

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
