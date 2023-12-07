---
sidebar_position: 4
---

# Przykłady od początku do końca

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

W repozytorium zawieramy kilka przykładów od początku do końca, korzystając z LlamaIndex.TS.

Sprawdź poniższe przykłady lub wypróbuj je i uzupełnij w kilka minut za pomocą interaktywnych samouczków Github Codespace udostępnionych przez Dev-Docs [tutaj](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Silnik czatu](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Przeczytaj plik i porozmawiaj o nim z LLM.

## [Indeks wektorowy](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Utwórz indeks wektorowy i zapytaj go. Indeks wektorowy będzie używał osadzeń do pobrania k najbardziej istotnych węzłów. Domyślnie, k wynosi 2.

"

## [Indeks podsumowania](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Utwórz indeks listy i zapytaj go. Ten przykład wykorzystuje również `LLMRetriever`, który używa LLM do wyboru najlepszych węzłów do użycia podczas generowania odpowiedzi.

"

## [Zapisz / Wczytaj indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Utwórz i wczytaj indeks wektorowy. Automatyczne zapisywanie na dysku w LlamaIndex.TS następuje automatycznie po utworzeniu obiektu kontekstu przechowywania.

"

## [Niestandardowy indeks wektorowy](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Utwórz indeks wektorowy i zapytaj go, konfigurując jednocześnie `LLM`, `ServiceContext` i `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Utwórz OpenAI LLM i użyj go bezpośrednio do czatu.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Utwórz Llama-2 LLM i użyj go bezpośrednio do czatu.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Wykorzystuje `SubQuestionQueryEngine`, który dzieli złożone zapytania na wiele pytań, a następnie agreguje odpowiedzi na wszystkie podpytania.

"

## [Moduły na niskim poziomie](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Ten przykład wykorzystuje kilka komponentów na niskim poziomie, co eliminuje potrzebę posiadania rzeczywistego silnika zapytań. Te komponenty mogą być używane w dowolnym miejscu, w dowolnej aplikacji, lub dostosowane i podklasowane, aby spełnić Twoje własne potrzeby.

"
