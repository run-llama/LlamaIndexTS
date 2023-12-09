---
sidebar_position: 0
slug: /
---

# Čo je LlamaIndex.TS?

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

LlamaIndex.TS je rámec dát pre aplikácie LLM na spracovanie, štruktúrovanie a prístup k súkromným alebo doménovo špecifickým údajom. Zatiaľ čo je k dispozícii aj balíček pre Python (viď [tu](https://docs.llamaindex.ai/en/stable/)), LlamaIndex.TS ponúka základné funkcie v jednoduchom balíčku, optimalizovanom pre použitie s TypeScriptom.

## 🚀 Prečo LlamaIndex.TS?

V podstate LLM ponúka prirodzené jazykové rozhranie medzi ľuďmi a odvodenými údajmi. Široko dostupné modely sú predtrénované na obrovské množstvo verejne dostupných údajov, od Wikipédie a mailingových zoznamov po učebnice a zdrojový kód.

Aplikácie postavené na LLM často vyžadujú rozšírenie týchto modelov o súkromné alebo doménovo špecifické údaje. Bohužiaľ, tieto údaje môžu byť rozptýlené medzi izolovanými aplikáciami a úložiskami údajov. Nachádzajú sa za rozhraniami API, v SQL databázach alebo sú uväznené v PDF a prezentáciách.

A tu prichádza **LlamaIndex.TS**.

## 🦙 Ako môže LlamaIndex.TS pomôcť?

LlamaIndex.TS poskytuje nasledujúce nástroje:

- **Načítanie dát** - priamo načítajte svoje existujúce údaje vo formátoch `.txt`, `.pdf`, `.csv`, `.md` a `.docx`
- **Indexy dát** - štruktúrujte svoje údaje do medzi-reprezentácií, ktoré sú jednoduché a výkonné pre LLM na spracovanie.
- **Engine (motory)** - poskytujú prístup k vašim údajom pomocou prirodzeného jazyka. Napríklad:
  - Query enginy sú výkonné rozhrania pre získavanie poznatkov s rozšíreným výstupom.
  - Chat enginy sú konverzačné rozhrania pre viacsprávové interakcie "tam a späť" s vašimi údajmi.

## 👨‍👩‍👧‍👦 Pre koho je LlamaIndex?

LlamaIndex.TS poskytuje základnú sadu nástrojov, ktoré sú nevyhnutné pre každého, kto staví aplikácie LLM s použitím JavaScriptu a TypeScriptu.

Naša vyššia úroveň API umožňuje začiatočníkom používať LlamaIndex.TS na spracovanie a vyhľadávanie ich údajov.

Pre zložitejšie aplikácie naša nižšia úroveň API umožňuje pokročilým používateľom prispôsobiť a rozšíriť akýkoľvek modul - konektory údajov, indexy, získavače a vyhľadávacie motory, aby vyhovovali ich potrebám.

## Začíname

`npm install llamaindex`

Naša dokumentácia obsahuje [Inštalačné pokyny](./installation.md) a [Úvodný tutoriál](./starter.md) pre vytvorenie vašej prvej aplikácie.

Keď už máte všetko pripravené, [Vysokoúrovňové koncepty](./concepts.md) poskytujú prehľad o modulárnej architektúre LlamaIndexu. Pre viac praktických príkladov si prečítajte naše [Tutoriály od začiatku do konca](./end_to_end.md).

## 🗺️ Ekosystém

Na stiahnutie alebo prispievanie nájdete LlamaIndex na:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

"

## Komunita

Potrebujete pomoc? Máte návrh na novú funkciu? Pripojte sa k LlamaIndex komunite:

- Twitter: https://twitter.com/llama_index
- Discord: https://discord.gg/dGcwcsnxhU
