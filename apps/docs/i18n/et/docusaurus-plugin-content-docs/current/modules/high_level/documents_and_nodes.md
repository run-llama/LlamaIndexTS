---
sidebar_position: 0
---

# Dokumendid ja sõlmed

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

`Dokumendid` ja `Sõlmed` on igasuguse indeksi põhilised ehitusplokid. Kuigi nende objektide API on sarnane, esindavad `Dokumendi` objektid terviklikke faile, samas kui `Sõlmed` on väiksemad tükid sellest algsest dokumendist, mis sobivad LLM-iks ja küsimustele-vastustele.

```typescript
import { Document } from "llamaindex";

dokument = new Document({ text: "tekst", metadata: { key: "val" } });
```

## API viide

- [Dokument](../../api/classes/Document.md)
- [TekstiSõlm](../../api/classes/TextNode.md)

"
