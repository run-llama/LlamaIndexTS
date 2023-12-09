---
sidebar_position: 6
---

# ResponseSynthesizer (Vastuse sünteesija)

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

ResponseSynthesizer on vastutav päringu, sõlmede ja vihjete mallide saatmise eest LLM-ile vastuse genereerimiseks. On mõned olulised režiimid vastuse genereerimiseks:

- `Refine` (Täpsusta): "loo ja täpsusta" vastust, minnes järjest läbi iga leitud tekstitüki.
  See teeb iga sõlme jaoks eraldi LLM-kõne. Sobib üksikasjalikumate vastuste jaoks.
- `CompactAndRefine` (Vaikimisi): "kokku suru" vihje iga LLM-kõne ajal, täites maksimaalse vihje suurusega nii palju tekstitükke kui võimalik. Kui on liiga palju tükke, et need ühte vihjesse mahutada, "loo ja täpsusta" vastus, minnes läbi mitme kokku surutud vihje. Sama mis `refine`, kuid peaks vähendama LLM-kõnede arvu.
- `TreeSummarize` (Puusummeerimine): Antud tekstitükkide kogumi ja päringu korral koosta rekursiivselt puu ja tagasta juursõlm vastusena. Sobib kokkuvõtte tegemiseks.
- `SimpleResponseBuilder` (Lihtne vastuse koostaja): Antud tekstitükkide kogumi ja päringu korral rakenda päringut igale tekstitükile, kogudes vastused massiivi. Tagastab kõigi vastuste kokkuliidetud stringi. Sobib olukordades, kus peate sama päringut eraldi käitama igale tekstitükile.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Olen 10-aastane." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John on 20-aastane." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Kui vana ma olen?",
  nodesWithScore,
);
console.log(response.response);
```

## API viide

- [ResponseSynthesizer (Vastuse sünteesija)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Täpsusta)](../../api/classes/Refine.md)
- [CompactAndRefine (Kokku suru ja täpsusta)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Puusummeerimine)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Lihtne vastuse koostaja)](../../api/classes/SimpleResponseBuilder.md)

"
