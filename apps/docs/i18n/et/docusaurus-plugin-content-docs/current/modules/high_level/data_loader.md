---
sidebar_position: 1
---

# Lugeja / Laadija

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

LlamaIndex.TS toetab failide lihtsat laadimist kaustadest, kasutades `SimpleDirectoryReader` klassi. Praegu toetatakse `.txt`, `.pdf`, `.csv`, `.md` ja `.docx` faile, tulevikus on plaanis lisada veel rohkem!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

dokumendid = new SimpleDirectoryReader().loadData("./andmed");
```

## API viide

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
