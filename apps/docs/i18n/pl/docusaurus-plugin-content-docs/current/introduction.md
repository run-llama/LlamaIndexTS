---
sidebar_position: 0
slug: /
---

# Czym jest LlamaIndex.TS?

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

LlamaIndex.TS to framework danych dla aplikacji LLM, który umożliwia pobieranie, strukturyzację i dostęp do prywatnych lub specyficznych dla domeny danych. Chociaż dostępny jest również pakiet Python (patrz [tutaj](https://docs.llamaindex.ai/en/stable/)), LlamaIndex.TS oferuje podstawowe funkcje w prostym pakiecie, zoptymalizowanym do użytku z TypeScript.

## 🚀 Dlaczego LlamaIndex.TS?

W swojej istocie LLM-y oferują naturalny interfejs językowy między ludźmi a wywnioskowanymi danymi. Powszechnie dostępne modele są wstępnie przeszkolone na ogromnych ilościach publicznie dostępnych danych, od Wikipedii i list mailingowych po podręczniki i kod źródłowy.

Aplikacje oparte na LLM-ach często wymagają rozszerzenia tych modeli o prywatne lub specyficzne dla domeny dane. Niestety, te dane mogą być rozproszone w różnych aplikacjach i magazynach danych. Mogą znajdować się za interfejsami API, w bazach danych SQL lub być uwięzione w plikach PDF i prezentacjach.

Właśnie tutaj pojawia się **LlamaIndex.TS**.

## 🦙 Jak LlamaIndex.TS może pomóc?

LlamaIndex.TS udostępnia następujące narzędzia:

- **Wczytywanie danych** - umożliwia wczytywanie istniejących danych w formatach `.txt`, `.pdf`, `.csv`, `.md` i `.docx`
- **Indeksy danych** - strukturyzuje dane w pośrednich reprezentacjach, które są łatwe i wydajne do wykorzystania przez LLM.
- **Silniki** - zapewniają dostęp do danych za pomocą języka naturalnego. Na przykład:
  - Silniki zapytań to potężne interfejsy do pobierania wzbogaconych wiedzą wyników.
  - Silniki czatów to interfejsy konwersacyjne umożliwiające interakcje "tam i z powrotem" z danymi.

## 👨‍👩‍👧‍👦 Dla kogo jest LlamaIndex?

LlamaIndex.TS dostarcza podstawowy zestaw narzędzi, niezbędnych dla wszystkich tworzących aplikacje LLM przy użyciu JavaScript i TypeScript.

Nasze API na wysokim poziomie umożliwia początkującym użytkownikom korzystanie z LlamaIndex.TS do przetwarzania i wyszukiwania danych.

Dla bardziej zaawansowanych aplikacji nasze API na niższym poziomie umożliwia zaawansowanym użytkownikom dostosowanie i rozszerzenie dowolnego modułu - łączników danych, indeksów, odbiorników i silników zapytań - aby dostosować je do swoich potrzeb.

## Rozpoczęcie pracy

`npm install llamaindex`

Nasza dokumentacja zawiera [Instrukcje instalacji](./installation.mdx) oraz [Samouczek dla początkujących](./starter.md), który pomoże Ci zbudować swoją pierwszą aplikację.

Gdy już będziesz gotowy, [Wysokopoziomowe koncepcje](./getting_started/concepts.md) zawierają przegląd modułowej architektury LlamaIndex. Jeśli chcesz zobaczyć praktyczne przykłady, zapoznaj się z naszymi [Samouczkami od początku do końca](./end_to_end.md).

## 🗺️ Ekosystem

Aby pobrać lub przyczynić się do projektu, odwiedź LlamaIndex na:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

"

## Społeczność

Potrzebujesz pomocy? Masz sugestię dotyczącą funkcji? Dołącz do społeczności LlamaIndex:

- Twitter: https://twitter.com/llama_index
- Discord: https://discord.gg/dGcwcsnxhU
