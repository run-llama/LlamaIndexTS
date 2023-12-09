---
sidebar_position: 1
---

# 讀取器 / 載入器

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

LlamaIndex.TS 支援使用 `SimpleDirectoryReader` 類別從資料夾輕鬆載入檔案。目前支援 `.txt`、`.pdf`、`.csv`、`.md` 和 `.docx` 檔案，未來還有更多計劃中的支援！

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API 參考

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
