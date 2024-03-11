---
sidebar_position: 0
---

# Dokumentai ir Mazgai

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

`Dokumentai` ir `Mazgai` yra pagrindiniai bet kokio indekso statybiniai blokai. Nors šių objektų API yra panašus, `Dokumento` objektai atstovauja visiems failams, o `Mazgai` yra mažesni šio pradinio dokumento fragmentai, tinkami LLM ir Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "tekstas", metadata: { key: "val" } });
```

## API Nuorodos

- [Dokumentas](../../api/classes/Document.md)
- [TekstoMazgas](../../api/classes/TextNode.md)

"
