---
sidebar_position: 1
---

# Reader / Loader

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

LlamaIndex.TS unterstützt das einfache Laden von Dateien aus Ordnern mithilfe der Klasse `SimpleDirectoryReader`. Derzeit werden `.txt`, `.pdf`, `.csv`, `.md` und `.docx` Dateien unterstützt, mit weiteren geplanten Dateiformaten in der Zukunft!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API-Referenz

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
