---
sidebar_position: 1
---

# Четец / Зареждач

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

LlamaIndex.TS поддържа лесно зареждане на файлове от папки с помощта на класа `SimpleDirectoryReader`. В момента се поддържат файлове с разширения `.txt`, `.pdf`, `.csv`, `.md` и `.docx`, с планове за добавяне на още в бъдеще!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Референция

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
