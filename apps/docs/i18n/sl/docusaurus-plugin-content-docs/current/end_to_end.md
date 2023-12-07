---
sidebar_position: 4
---

# Príklady od začiatku do konca

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

V repozitári máme niekoľko príkladov od začiatku do konca, ktoré používajú LlamaIndex.TS.

Pozrite si nižšie uvedené príklady alebo ich vyskúšajte a dokončite ich v priebehu niekoľkých minút s interaktívnymi tutoriálmi na Github Codespace poskytovanými Dev-Docs [tu](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Načítajte súbor a diskutujte o ňom s LLM.

## [Vektorový Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Vytvorte vektorový index a vyhľadajte ho. Vektorový index bude používať vložky na získanie najrelevantnejších k najlepším k uzlom. Predvolená hodnota pre k je 2.

"

## [Index súhrnu](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Vytvorte zoznamový index a vyhľadávajte v ňom. Tento príklad tiež používa `LLMRetriever`, ktorý použije LLM na výber najlepších uzlov na použitie pri generovaní odpovede.

"

## [Uloženie / Načítanie indexu](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Vytvorte a načítajte vektorový index. Ukladanie na disk v LlamaIndex.TS sa deje automaticky, keď je vytvorený objekt kontextu úložiska.

## [Vlastný vektorový index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Vytvorte vektorový index a vyhľadávajte v ňom, pričom konfigurujete `LLM`, `ServiceContext` a `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Vytvorte OpenAI LLM a priamo ho použite na chatovanie.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Vytvorte Llama-2 LLM a priamo ho použite na chatovanie.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Používa `SubQuestionQueryEngine`, ktorý rozdeľuje zložité dotazy na viacero otázok a potom agreguje odpoveď zo všetkých podotázok.

## [Moduly nízkej úrovne](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Tento príklad používa niekoľko modulov nízkej úrovne, čo odstraňuje potrebu skutočného vyhľadávacieho enginu. Tieto komponenty môžu byť použité kdekoľvek, v akomkoľvek aplikácii, alebo môžu byť prispôsobené a podtriedené, aby vyhovovali vašim vlastným potrebám.
