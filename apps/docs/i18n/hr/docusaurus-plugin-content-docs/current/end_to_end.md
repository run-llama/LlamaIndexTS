---
sidebar_position: 4
---

# Primjeri od početka do kraja

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

Uključujemo nekoliko primjera od početka do kraja koji koriste LlamaIndex.TS u repozitoriju.

Pogledajte primjere u nastavku ili ih isprobajte i dovršite u nekoliko minuta uz interaktivne tutorijale na Github Codespace koje pruža Dev-Docs [ovdje](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Pročitajte datoteku i razgovarajte o njoj s LLM.

## [Vektor Indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Stvorite vektor indeks i pretražite ga. Vektor indeks će koristiti ugrađivanja za dohvaćanje najrelevantnijih čvorova. Prema zadanim postavkama, najboljih k je 2.

"

## [Indeks sažetka](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Stvorite indeks liste i pretražite ga. Ovaj primjer također koristi `LLMRetriever`, koji će koristiti LLM za odabir najboljih čvorova za korištenje prilikom generiranja odgovora.

"

## [Spremi / Učitaj indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Stvorite i učitajte vektorski indeks. Pohrana na disk u LlamaIndex.TS se automatski događa jednom kada je stvoren objekt konteksta pohrane.

"

## [Prilagođeni vektorski indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Stvorite vektorski indeks i pretražujte ga, istovremeno konfigurirajući `LLM`, `ServiceContext` i `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Stvorite OpenAI LLM i izravno ga koristite za razgovor.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Stvorite Llama-2 LLM i izravno ga koristite za chat.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Koristi `SubQuestionQueryEngine`, koji razbija složene upite na više pitanja, a zatim agregira odgovor na sva podpitanja.

"

## [Moduli niskog nivoa](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Ovaj primjer koristi nekoliko komponenti niskog nivoa, što uklanja potrebu za stvarnim upitnim motorom. Ove komponente se mogu koristiti bilo gdje, u bilo kojoj aplikaciji, ili prilagođene i podklase kako bi zadovoljile vaše vlastite potrebe.

"
