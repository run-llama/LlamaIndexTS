---
sidebar_position: 1
---

# 读取器 / 加载器

LlamaIndex.TS 支持使用 `SimpleDirectoryReader` 类从文件夹中轻松加载文件。目前支持 `.txt`、`.pdf`、`.csv`、`.md` 和 `.docx` 文件，未来计划支持更多格式！

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API 参考

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
