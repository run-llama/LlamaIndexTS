---
sidebar_position: 1
---

# Lecteur / Chargeur

LlamaIndex.TS prend en charge le chargement facile de fichiers à partir de dossiers en utilisant la classe `SimpleDirectoryReader`. Actuellement, les fichiers `.txt`, `.pdf`, `.csv`, `.md` et `.docx` sont pris en charge, avec plus à venir dans le futur !

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Référence de l'API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader)
