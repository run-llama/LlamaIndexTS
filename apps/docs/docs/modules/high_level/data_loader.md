---
sidebar_position: 1
---

# Reader / Loader

LlamaIndex.TS supports easy loading of files from folders using the `SimpleDirectoryReader` class. Currently, `.txt` and `.pdf` files are supported, with more planned in the future!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```
