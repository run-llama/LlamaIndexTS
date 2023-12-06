---
sidebar_position: 4
---

# Primeri od začetka do konca

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Vključujemo več primerov od začetka do konca, ki uporabljajo LlamaIndex.TS v repozitoriju.

Preverite spodnje primere ali jih preizkusite in dokončajte v nekaj minutah s pomočjo interaktivnih vadnic Github Codespace, ki jih ponuja Dev-Docs [tukaj](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Preberite datoteko in se pogovarjajte o njej z LLM.

## [Vektorski indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Ustvarite vektorski indeks in ga poizvedujte. Vektorski indeks bo uporabil vložitve za pridobitev najbolj relevantnih vozlišč. Privzeto je najboljših k enak 2.

## [Povzetek indeksa](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Ustvarite seznam indeksov in ga poizvedujte. Ta primer uporablja tudi `LLMRetriever`, ki bo uporabil LLM za izbiro najboljših vozlišč za uporabo pri generiranju odgovora.

"

## [Shrani / Naloži indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Ustvarite in naložite vektorski indeks. V LlamaIndex.TS se samodejno izvede shranjevanje na disk, ko je ustvarjen objekt konteksta shranjevanja.

"

## [Prilagojeni vektorski indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Ustvarite vektorski indeks in ga poizvedujte, hkrati pa konfigurirajte `LLM`, `ServiceContext` in `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Ustvarite OpenAI LLM in ga neposredno uporabite za klepet.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Ustvarite Llama-2 LLM in ga neposredno uporabite za klepet.

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Uporablja `SubQuestionQueryEngine`, ki razbije kompleksna poizvedovanja na več podvprašanj in nato združi odgovore na vsa podvprašanja.

"

## [Nizkonivojski moduli](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Ta primer uporablja več nizkonivojskih komponent, kar odpravlja potrebo po dejanskem iskalnem motorju. Te komponente se lahko uporabljajo kjerkoli, v kateri koli aplikaciji ali pa jih prilagodite in podrazredite, da izpolnite svoje potrebe.
