---
sidebar_position: 0
---

# Dokumentit ja solmut

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

`Dokumentit` ja `Solmut` ovat minkä tahansa indeksin perusrakennuspalikoita. Vaikka näiden objektien API on samankaltainen, `Dokumentti`-objektit edustavat kokonaisia tiedostoja, kun taas `Solmut` ovat pienempiä osia alkuperäisestä dokumentista, jotka sopivat LLM:ään ja kysymyksiin ja vastauksiin.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "teksti", metadata: { avain: "arvo" } });
```

## API-viite

- [Dokumentti](../../api/classes/Document.md)
- [TekstiSolmu](../../api/classes/TextNode.md)

"
