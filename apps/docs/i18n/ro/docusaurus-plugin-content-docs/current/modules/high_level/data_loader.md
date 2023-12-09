---
sidebar_position: 1
---

# Cititor / Încărcător

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

LlamaIndex.TS suportă încărcarea ușoară a fișierelor din foldere folosind clasa `SimpleDirectoryReader`. În prezent, sunt suportate fișierele `.txt`, `.pdf`, `.csv`, `.md` și `.docx`, cu planuri pentru suportul altor formate în viitor!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Referință API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
