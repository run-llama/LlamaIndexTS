---
sidebar_position: 0
---

# سند ها و گره ها

`undefined`

`سند` ها و `گره` ها از اجزای اساسی هر نمایه هستند. در حالی که API برای این اشیاء مشابه است، اشیاء `سند` فایل های کامل را نمایندگی می کنند، در حالی که `گره` ها قطعات کوچکتری از آن سند اصلی هستند که برای یک LLM و Q&A مناسب هستند.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "متن", metadata: { کلید: "مقدار" } });
```

## مرجع API

- [سند](../../api/classes/Document.md)
- [گره متنی](../../api/classes/TextNode.md)

"
