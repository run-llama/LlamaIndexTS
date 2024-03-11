---
sidebar_position: 1
---

# Skaitytuvas / Įkėlėjas

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

LlamaIndex.TS palaiko lengvą failų įkėlimą iš aplankų naudojant `SimpleDirectoryReader` klasę. Šiuo metu palaikomi `.txt`, `.pdf`, `.csv`, `.md` ir `.docx` failų formatai, o ateityje planuojama palaikyti daugiau!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Nuorodos

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
