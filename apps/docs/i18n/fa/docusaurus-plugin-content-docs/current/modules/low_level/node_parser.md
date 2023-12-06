---
sidebar_position: 3
---

# NodeParser (تجزیه کننده گره)

`undefined`

`NodeParser` در LlamaIndex مسئول تقسیم اشیاء `Document` به اشیاء `Node` قابل مدیریت تر است. وقتی شما `.fromDocuments()` را فراخوانی می کنید، `NodeParser` از `ServiceContext` برای انجام این کار به صورت خودکار استفاده می شود. به طور جایگزین، می توانید از آن برای تقسیم سند ها قبل از زمان استفاده استفاده کنید.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "من 10 سال دارم. جان 20 سال دارد." }),
]);
```

## TextSplitter (تقسیم کننده متن)

تقسیم کننده متن زیر، متن را بر اساس جملات تقسیم می کند. همچنین می توانید از آن به عنوان یک ماژول مستقل برای تقسیم متن خام استفاده کنید.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("سلام دنیا");
```

## مرجع API

- [SimpleNodeParser (تجزیه کننده گره ساده)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (تقسیم کننده جمله)](../../api/classes/SentenceSplitter.md)

"
