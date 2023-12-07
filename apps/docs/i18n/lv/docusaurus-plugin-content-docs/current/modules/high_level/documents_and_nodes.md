---
sidebar_position: 0
---

# Dokumenti un mezgli

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

`Dokumenti` un `Mezgli` ir pamata būvēšanas bloki jebkurai indeksam. Lai gan šo objektu API ir līdzīgs, `Dokumenta` objekti pārstāv veselas failus, bet `Mezgli` ir mazāki šī oriģinālā dokumenta gabali, kas ir piemēroti LLM un Q&A.

```typescript
import { Dokuments } from "llamaindex";

dokuments = new Dokuments({
  teksts: "teksts",
  metadati: { atslēga: "vērtība" },
});
```

## API Atsauce

- [Dokuments](../../api/classes/Document.md)
- [TekstaMezgls](../../api/classes/TextNode.md)

"
