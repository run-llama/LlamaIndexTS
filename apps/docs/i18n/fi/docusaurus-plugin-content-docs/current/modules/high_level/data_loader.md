---
sidebar_position: 1
---

# Lukija / Lataaja

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

LlamaIndex.TS tukee tiedostojen helppoa lataamista kansioista käyttämällä `SimpleDirectoryReader` -luokkaa. Tällä hetkellä tuetaan `.txt`, `.pdf`, `.csv`, `.md` ja `.docx` -tiedostoja, ja tulevaisuudessa on suunnitteilla lisää!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API-viite

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
