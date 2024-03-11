---
sidebar_position: 1
---

# Lector / Cargador

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

LlamaIndex.TS admite la carga fácil de archivos desde carpetas utilizando la clase `SimpleDirectoryReader`. Actualmente, se admiten archivos `.txt`, `.pdf`, `.csv`, `.md` y `.docx`, ¡con más planeados para el futuro!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Referencia de API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
