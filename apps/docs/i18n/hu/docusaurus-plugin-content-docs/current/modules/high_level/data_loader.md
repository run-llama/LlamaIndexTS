---
sidebar_position: 1
---

# Olvasó / Betöltő

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A LlamaIndex.TS egyszerűen lehetővé teszi a fájlok könnyű betöltését mappákból a `SimpleDirectoryReader` osztály segítségével. Jelenleg a `.txt`, `.pdf`, `.csv`, `.md` és `.docx` fájlok támogatottak, továbbiak tervezés alatt!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Referencia

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
