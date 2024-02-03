---
sidebar_position: 3
---

# Reader / Loader

LlamaIndex.TS supports easy loading of files from folders using the `SimpleDirectoryReader` class. Currently, `.txt`, `.pdf`, `.csv`, `.md` and `.docx` files are supported, with more planned in the future!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Reference

- [SimpleDirectoryReader](../api/classes/SimpleDirectoryReader.md)
