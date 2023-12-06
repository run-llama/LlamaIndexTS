---
sidebar_position: 6
---

# ResponseSynthesizer (Syntetizátor odpovědí)

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

ResponseSynthesizer je zodpovědný za odesílání dotazu, uzlů a šablon promptů do LLM (Language Model) pro generování odpovědi. Existuje několik klíčových režimů pro generování odpovědi:

- `Refine` (Vylepšit): "vytvořit a vylepšit" odpověď postupným procházením každého získaného textového úseku. Tímto způsobem se provádí samostatný volání LLM pro každý uzel. Dobré pro podrobnější odpovědi.
- `CompactAndRefine` (Kompaktní a vylepšit) (výchozí): "zkompaktovat" prompt během každého volání LLM tím, že se do maximální velikosti promptu vloží co nejvíce textových úseků. Pokud je příliš mnoho úseků na vložení do jednoho promptu, "vytvořit a vylepšit" odpověď postupným procházením více kompaktních promptů. Stejné jako `Refine`, ale mělo by to vést k menšímu počtu volání LLM.
- `TreeSummarize` (Stromové shrnutí): Na základě sady textových úseků a dotazu rekurzivně sestaví strom a vrátí kořenový uzel jako odpověď. Dobré pro účely shrnutí.
- `SimpleResponseBuilder` (Jednoduchý generátor odpovědí): Na základě sady textových úseků a dotazu aplikuje dotaz na každý textový úsek a odpovědi akumuluje do pole. Vrátí spojený řetězec všech odpovědí. Dobré, když potřebujete spustit stejný dotaz samostatně pro každý textový úsek.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Je mi 10 let." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "Johnovi je 20 let." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Kolik mi je let?",
  nodesWithScore,
);
console.log(response.response);
```

## API Reference (Referenční příručka)

- [ResponseSynthesizer (Syntetizátor odpovědí)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Vylepšit)](../../api/classes/Refine.md)
- [CompactAndRefine (Kompaktní a vylepšit)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Stromové shrnutí)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Jednoduchý generátor odpovědí)](../../api/classes/SimpleResponseBuilder.md)
