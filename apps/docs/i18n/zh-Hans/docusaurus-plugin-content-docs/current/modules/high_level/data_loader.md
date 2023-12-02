# 读取器 / 装载器

LlamaIndex.TS支持使用`SimpleDirectoryReader`类从文件夹轻松加载文件。目前支持`.txt`、`.pdf`、`.csv`、`.md`和`.docx`文件，未来将支持更多文件类型！

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API 参考

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
