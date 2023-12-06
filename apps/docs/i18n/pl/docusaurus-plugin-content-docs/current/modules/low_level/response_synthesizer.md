---
sidebar_position: 6
---

# ResponseSynthesizer (SyntezatorOdpowiedzi)

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

ResponseSynthesizer jest odpowiedzialny za wysyłanie zapytania, węzłów i szablonów promptów do LLM w celu wygenerowania odpowiedzi. Istnieje kilka kluczowych trybów generowania odpowiedzi:

- `Refine` (Udoskonalanie): "tworzenie i udoskonalanie" odpowiedzi poprzez sekwencyjne przechodzenie przez każdy pobrany fragment tekstu. Wykonuje osobne wywołanie LLM dla każdego węzła. Dobry dla bardziej szczegółowych odpowiedzi.
- `CompactAndRefine` (KompaktowanieIUdoskonalanie) (domyślny): "kompaktowanie" promptu podczas każdego wywołania LLM poprzez umieszczenie jak największej liczby fragmentów tekstu, które mogą zmieścić się w maksymalnym rozmiarze promptu. Jeśli jest zbyt wiele fragmentów do umieszczenia w jednym promptu, "tworzy i udoskonala" odpowiedź, przechodząc przez wiele kompaktowych promptów. To samo co `refine`, ale powinno skutkować mniejszą liczbą wywołań LLM.
- `TreeSummarize` (PodsumowanieDrzewa): Na podstawie zestawu fragmentów tekstu i zapytania rekurencyjnie konstruuje drzewo i zwraca węzeł korzenia jako odpowiedź. Dobry do celów podsumowania.
- `SimpleResponseBuilder` (ProstyBudowniczyOdpowiedzi): Na podstawie zestawu fragmentów tekstu i zapytania stosuje zapytanie do każdego fragmentu tekstu, gromadząc odpowiedzi w tablicy. Zwraca połączony ciąg wszystkich odpowiedzi. Dobry, gdy potrzebujesz osobno uruchomić to samo zapytanie dla każdego fragmentu tekstu.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Mam 10 lat." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John ma 20 lat." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Ile mam lat?",
  nodesWithScore,
);
console.log(response.response);
```

## Dokumentacja interfejsu API

- [ResponseSynthesizer (SyntezatorOdpowiedzi)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Udoskonalanie)](../../api/classes/Refine.md)
- [CompactAndRefine (KompaktowanieIUdoskonalanie)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (PodsumowanieDrzewa)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (ProstyBudowniczyOdpowiedzi)](../../api/classes/SimpleResponseBuilder.md)

"
