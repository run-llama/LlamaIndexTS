---
sidebar_position: 3
---

# QueryEngine (Silnik zapytań)

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

Silnik zapytań zawiera w sobie `Retriever` oraz `ResponseSynthesizer` w jednym potoku, który używa ciągu zapytań do pobrania węzłów, a następnie wysyła je do LLM w celu wygenerowania odpowiedzi.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("ciąg zapytań");
```

## Silnik zapytań podpytań (Sub Question Query Engine)

Podstawową koncepcją Silnika zapytań podpytań jest podzielenie pojedynczego zapytania na wiele zapytań, uzyskanie odpowiedzi na każde z tych zapytań, a następnie połączenie tych różnych odpowiedzi w jedną spójną odpowiedź dla użytkownika. Można to porównać do techniki "przemyśl to krok po kroku", ale iterującej po źródłach danych!

### Rozpoczęcie pracy

Najłatwiejszym sposobem na rozpoczęcie próbowania Silnika zapytań podpytań jest uruchomienie pliku subquestion.ts w folderze [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Narzędzia

Silnik zapytań podpytań jest implementowany za pomocą narzędzi (Tools). Podstawową ideą narzędzi jest to, że są to opcje wykonywalne dla dużego modelu językowego. W tym przypadku nasz Silnik zapytań podpytań polega na QueryEngineTool, który, jak się domyślasz, jest narzędziem do wykonywania zapytań na Silniku zapytań. Pozwala to modelowi na możliwość zapytania różnych dokumentów w celu uzyskania odpowiedzi na różne pytania, na przykład. Można również sobie wyobrazić, że Silnik zapytań podpytań może używać narzędzia, które wyszukuje coś w sieci lub uzyskuje odpowiedź za pomocą Wolfram Alpha.

Więcej informacji na temat narzędzi można znaleźć w dokumentacji Pythona LlamaIndex https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## Dokumentacja interfejsu API

- [RetrieverQueryEngine (Silnik zapytań Retriever)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Silnik zapytań podrzędnych)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Narzędzie silnika zapytań)](../../api/interfaces/QueryEngineTool.md)

"
