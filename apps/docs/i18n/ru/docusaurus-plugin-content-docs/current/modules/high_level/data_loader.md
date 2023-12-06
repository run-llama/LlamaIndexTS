---
sidebar_position: 1
---

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

# Reader / Loader (Читатель / Загрузчик)

LlamaIndex.TS поддерживает простую загрузку файлов из папок с использованием класса `SimpleDirectoryReader`. В настоящее время поддерживаются файлы `.txt`, `.pdf`, `.csv`, `.md` и `.docx`, а в будущем планируется добавить еще больше форматов!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Справочник по API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
