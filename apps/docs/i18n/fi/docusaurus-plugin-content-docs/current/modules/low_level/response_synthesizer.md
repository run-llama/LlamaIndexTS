---
sidebar_position: 6
---

# ResponseSynthesizer

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

ResponseSynthesizer on vastuussa kyselyn, solmujen ja ohjepohjien lähettämisestä LLM:lle vastauksen luomiseksi. On muutamia avainmoodit vastauksen luomiseen:

- `Refine`: "luo ja hienosäädä" vastaus käymällä läpi jokainen noudettu tekstipala peräkkäin.
  Tämä tekee erillisen LLM-kutsun jokaiselle solmulle. Hyvä yksityiskohtaisempiin vastauksiin.
- `CompactAndRefine` (oletus): "tiivistä" ohje jokaisen LLM-kutsun aikana täyttämällä niin
  monta tekstipalaa kuin mahtuu enimmäisohjeen kokoon. Jos on
  liian monta palaa täytettäväksi yhteen ohjeeseen, "luo ja hienosäädä" vastaus käymällä läpi
  useita tiivistettyjä ohjeita. Sama kuin `refine`, mutta tulisi johtaa vähemmän LLM-kutsuihin.
- `TreeSummarize`: Annetaan joukko tekstipaloja ja kysely, rakennetaan rekursiivisesti puu
  ja palautetaan juurisolmu vastauksena. Hyvä yhteenvedon tarkoituksiin.
- `SimpleResponseBuilder`: Annetaan joukko tekstipaloja ja kysely, sovelletaan kyselyä jokaiseen tekstiin
  palan aikana vastausten keräämiseksi taulukkoon. Palauttaa kaikkien
  vastausten yhdistetty merkkijono. Hyvä, kun tarvitset suorittaa saman kyselyn erikseen jokaiselle tekstille
  pala.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Olen 10-vuotias." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John on 20-vuotias." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Kuinka vanha minä olen?",
  nodesWithScore,
);
console.log(response.response);
```

## API-viite

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
