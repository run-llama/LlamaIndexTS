---
sidebar_position: 1
---

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

# Cititor / Încărcător

LlamaIndex.TS suportă încărcarea ușoară a fișierelor din foldere folosind clasa `SimpleDirectoryReader`. În prezent, sunt suportate fișierele `.txt`, `.pdf`, `.csv`, `.md` și `.docx`, cu planuri pentru suportul altor formate în viitor!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Referință API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
