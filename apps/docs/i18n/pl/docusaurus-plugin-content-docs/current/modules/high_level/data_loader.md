---
sidebar_position: 1
---

# Czytnik / Ładowarka

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

LlamaIndex.TS umożliwia łatwe wczytywanie plików z folderów za pomocą klasy `SimpleDirectoryReader`. Obecnie obsługiwane są pliki `.txt`, `.pdf`, `.csv`, `.md` i `.docx`, a w przyszłości planowane jest dodanie obsługi kolejnych formatów!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Dokumentacja API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
