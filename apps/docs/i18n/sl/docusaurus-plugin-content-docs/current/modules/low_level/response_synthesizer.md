---
sidebar_position: 6
---

# ResponseSynthesizer (Syntetizátor odpovedí)

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

ResponseSynthesizer je zodpovedný za odosielanie dotazu, uzlov a šablón promptov do LLM (Language Model) na generovanie odpovede. Existujú niekoľko kľúčových režimov na generovanie odpovede:

- `Refine` (Vylepšiť): "vytvoriť a vylepšiť" odpoveď postupným prechádzaním každého získaného textového úseku. Týmto spôsobom sa vykoná samostatné volanie LLM pre každý uzol. Dobré pre podrobné odpovede.
- `CompactAndRefine` (Kompaktné a vylepšiť) (predvolené): "kompaktovať" prompt počas každého volania LLM tým, že sa do maximálnej veľkosti promptu vloží čo najviac textových úsekov. Ak je príliš veľa úsekov na vloženie do jedného promptu, "vytvoriť a vylepšiť" odpoveď prechádzaním viacerých kompaktných promptov. To isté ako `refine`, ale malo by to vyžadovať menej volaní LLM.
- `TreeSummarize` (Zhrnutie stromu): Na základe sady textových úsekov a dotazu rekurzívne zostavte strom a vráťte koreňový uzol ako odpoveď. Dobré pre účely zhrnutia.
- `SimpleResponseBuilder` (Jednoduchý generátor odpovedí): Na základe sady textových úsekov a dotazu aplikujte dotaz na každý textový úsek a získané odpovede akumulujte do poľa. Vráti spojený reťazec všetkých odpovedí. Dobré, keď potrebujete spustiť rovnaký dotaz samostatne pre každý textový úsek.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Mám 10 rokov." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John má 20 rokov." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Koľko mám rokov?",
  nodesWithScore,
);
console.log(response.response);
```

## API Referencia

- [ResponseSynthesizer (Syntetizátor odpovedí)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Vylepšiť)](../../api/classes/Refine.md)
- [CompactAndRefine (Kompaktné a vylepšiť)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Zhrnutie stromu)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Jednoduchý generátor odpovedí)](../../api/classes/SimpleResponseBuilder.md)

"
