---
sidebar_position: 1
---

# Čítač / Načítavač

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

LlamaIndex.TS podporuje jednoduché načítavanie súborov z priečinkov pomocou triedy `SimpleDirectoryReader`. Momentálne sú podporované súbory s príponami `.txt`, `.pdf`, `.csv`, `.md` a `.docx`, s plánom podpory ďalších v budúcnosti!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Referencia

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
