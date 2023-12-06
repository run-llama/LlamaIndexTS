---
sidebar_position: 1
---

# Lector / Carregador

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

LlamaIndex.TS permet carregar fàcilment fitxers des de carpetes utilitzant la classe `SimpleDirectoryReader`. Actualment, són compatibles els fitxers `.txt`, `.pdf`, `.csv`, `.md` i `.docx`, i s'està planejant afegir-ne més en el futur!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Referència de l'API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
