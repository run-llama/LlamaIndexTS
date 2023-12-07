---
sidebar_position: 1
---

# Lasītājs / Ielādētājs

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

LlamaIndex.TS atbalsta vieglu failu ielādi no mapēm, izmantojot klasi `SimpleDirectoryReader`. Pašlaik tiek atbalstīti failu formāti `.txt`, `.pdf`, `.csv`, `.md` un `.docx`, bet nākotnē plānots atbalstīt vēl vairāk!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Atsauce

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
