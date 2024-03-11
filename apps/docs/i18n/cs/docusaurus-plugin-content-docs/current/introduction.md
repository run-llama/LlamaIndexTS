---
sidebar_position: 0
slug: /
---

# Co je LlamaIndex.TS?

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

LlamaIndex.TS je datový framework pro aplikace LLM, který slouží k příjmu, strukturování a přístupu k soukromým nebo doménově specifickým datům. Zatímco je také k dispozici python balíček (viz [zde](https://docs.llamaindex.ai/en/stable/)), LlamaIndex.TS nabízí základní funkce v jednoduchém balíčku, optimalizovaném pro použití s TypeScriptem.

## 🚀 Proč LlamaIndex.TS?

V jádru LLMs nabízejí přirozené jazykové rozhraní mezi lidmi a odvozenými daty. Široce dostupné modely jsou předtrénované na obrovském množství veřejně dostupných dat, od Wikipedie a mailingových seznamů po učebnice a zdrojový kód.

Aplikace postavené na LLMs často vyžadují rozšíření těchto modelů o soukromá nebo doménově specifická data. Bohužel, tato data mohou být rozptýlena mezi izolovanými aplikacemi a úložišti dat. Jsou za API, v SQL databázích nebo uvězněna v PDF a prezentacích.

A právě zde přichází **LlamaIndex.TS**.

## 🦙 Jak může LlamaIndex.TS pomoci?

LlamaIndex.TS poskytuje následující nástroje:

- **Načítání dat** - příjem vašich existujících dat ve formátech `.txt`, `.pdf`, `.csv`, `.md` a `.docx` přímo
- **Indexy dat** - strukturování vašich dat do prostředních reprezentací, které jsou snadné a výkonné pro použití s LLM.
- **Engine** poskytují přirozený přístup k vašim datům. Například:
  - Dotazovací enginy jsou výkonná rozhraní pro získávání znalostmi rozšířeného výstupu.
  - Chat enginy jsou konverzační rozhraní pro interakce s vašimi daty ve více zprávách, "zpětně a vpřed".

## 👨‍👩‍👧‍👦 Pro koho je LlamaIndex určen?

LlamaIndex.TS poskytuje základní sadu nástrojů, které jsou nezbytné pro všechny, kteří staví LLM aplikace s použitím JavaScriptu a TypeScriptu.

Naše API na vyšší úrovni umožňuje začátečníkům používat LlamaIndex.TS k příjmu a dotazování dat.

Pro složitější aplikace naše API na nižší úrovni umožňuje pokročilým uživatelům upravit a rozšířit libovolný modul - konektory dat, indexy, získávače a dotazovací enginy, aby vyhovoval jejich potřebám.

## Začínáme

`npm install llamaindex`

Naše dokumentace obsahuje [Návod k instalaci](./installation.mdx) a [Úvodní tutoriál](./starter.md) pro vytvoření vaší první aplikace.

Jakmile jste připraveni, [Vysokoúrovňové koncepty](./getting_started/concepts.md) poskytují přehled o modulární architektuře LlamaIndexu. Pro více praktických příkladů se podívejte na naše [Tutoriály od začátku do konce](./end_to_end.md).

## 🗺️ Ekosystém

Pro stažení nebo přispění najdete LlamaIndex na:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

"

## Komunita

Potřebujete pomoc? Máte návrh na novou funkci? Připojte se do komunity LlamaIndex:

- Twitter: https://twitter.com/llama_index
- Discord: https://discord.gg/dGcwcsnxhU
