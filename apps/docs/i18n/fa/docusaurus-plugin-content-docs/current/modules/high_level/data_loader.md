---
sidebar_position: 1
---

# خواننده / بارگذار

`undefined`

LlamaIndex.TS از طریق کلاس `SimpleDirectoryReader` بارگذاری آسان فایل ها از پوشه ها را پشتیبانی می کند. در حال حاضر، فایل های `.txt`، `.pdf`، `.csv`، `.md` و `.docx` پشتیبانی می شوند و در آینده بیشتری نیز برنامه ریزی شده است!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## مرجع API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
