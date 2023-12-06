---
sidebar_position: 6
---

# ResponseSynthesizer (Atsakymo sintezatorius)

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

ResponseSynthesizer (Atsakymo sintezatorius) yra atsakingas už užklausos, mazgų ir šablonų perdavimą LLM (Lietuvių kalbos modeliui) generuoti atsakymą. Yra keletas pagrindinių būdų, kaip generuoti atsakymą:

- `Refine` (Tobulinti): "sukurti ir tobulinti" atsakymą, eina per kiekvieną gautą teksto gabalą sekančiai. Tai reiškia atskirą LLM skambutį kiekvienam mazgui. Gerai tinka išsamesniems atsakymams.
- `CompactAndRefine` (Kompaktiškas ir tobulinti) (numatytasis): "kompaktiškai" sutraukti užklausą kiekviename LLM skambutyje, įkišant kuo daugiau teksto gabalų, kurie telpa maksimalioje užklausos dydžio riboje. Jei yra per daug gabalų, kad tilptų į vieną užklausą, "sukurti ir tobulinti" atsakymą, eina per kelis kompaktiškus užklausos šablonus. Tas pats kaip `refine`, bet turėtų reikšti mažiau LLM skambučių.
- `TreeSummarize` (Medžio santrauka): Pagal duotą teksto gabalų rinkinį ir užklausą, rekursyviai konstruojamas medis ir grąžinamas šakninis mazgas kaip atsakymas. Gerai tinka santraukos tikslais.
- `SimpleResponseBuilder` (Paprasto atsakymo kūrėjas): Pagal duotą teksto gabalų rinkinį ir užklausą, taikoma užklausa kiekvienam teksto gabalui, tuo pačiu kaupiant atsakymus į masyvą. Grąžina sujungtą visų atsakymų eilutę. Gerai tinka, kai reikia atskirai paleisti tą pačią užklausą kiekvienam teksto gabalui.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Man yra 10 metų." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "Džonas yra 20 metų." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Kiek man yra metų?",
  nodesWithScore,
);
console.log(response.response);
```

## API nuorodos

- [ResponseSynthesizer (Atsakymo sintezatorius)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Tobulinti)](../../api/classes/Refine.md)
- [CompactAndRefine (Kompaktiškas ir tobulinti)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Medžio santrauka)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Paprasto atsakymo kūrėjas)](../../api/classes/SimpleResponseBuilder.md)

"
