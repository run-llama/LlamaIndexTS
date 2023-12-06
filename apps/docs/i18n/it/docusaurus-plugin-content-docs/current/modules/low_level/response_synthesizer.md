---
sidebar_position: 6
---

# ResponseSynthesizer (Sintetizzatore di Risposta)

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Il ResponseSynthesizer è responsabile per l'invio della query, dei nodi e dei modelli di prompt al LLM per generare una risposta. Ci sono alcuni modi chiave per generare una risposta:

- `Refine` (Raffinare): "crea e raffina" una risposta passando sequenzialmente attraverso ogni frammento di testo recuperato. Questo effettua una chiamata separata al LLM per ogni nodo. Utile per risposte più dettagliate.
- `CompactAndRefine` (Compatto e Raffinare) (predefinito): "compatta" il prompt durante ogni chiamata al LLM inserendo il maggior numero possibile di frammenti di testo che possono essere inseriti nella dimensione massima del prompt. Se ci sono troppi frammenti da inserire in un solo prompt, "crea e raffina" una risposta passando attraverso più prompt compatti. Lo stesso di `refine`, ma dovrebbe comportare meno chiamate al LLM.
- `TreeSummarize` (Sommario ad Albero): Dato un insieme di frammenti di testo e la query, costruisce ricorsivamente un albero e restituisce il nodo radice come risposta. Utile per scopi di sommario.
- `SimpleResponseBuilder` (Costruttore di Risposta Semplice): Dato un insieme di frammenti di testo e la query, applica la query a ciascun frammento di testo accumulando le risposte in un array. Restituisce una stringa concatenata di tutte le risposte. Utile quando è necessario eseguire la stessa query separatamente su ciascun frammento di testo.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Ho 10 anni." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John ha 20 anni." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Quanti anni ho?",
  nodesWithScore,
);
console.log(response.response);
```

## Riferimento API

- [ResponseSynthesizer (Sintetizzatore di Risposta)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Raffinare)](../../api/classes/Refine.md)
- [CompactAndRefine (Compatto e Raffinare)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Sommario ad Albero)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Costruttore di Risposta Semplice)](../../api/classes/SimpleResponseBuilder.md)

"
