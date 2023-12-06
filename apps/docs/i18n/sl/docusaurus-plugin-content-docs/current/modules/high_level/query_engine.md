---
sidebar_position: 3
---

# QueryEngine (Dotazný modul)

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

Dotazný modul obaluje `Retriever` a `ResponseSynthesizer` do rúry, ktorá použije reťazec dotazu na získanie uzlov a potom ich pošle do LLM na generovanie odpovede.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("reťazec dotazu");
```

## Dotazný engine pre podotázky

Základný koncept dotazného enginu pre podotázky spočíva v tom, že rozdelí jediný dotaz na viacero dotazov, získa odpoveď pre každý z týchto dotazov a potom tieto rôzne odpovede spojí do jednej súvislej odpovede pre používateľa. Môžete si ho predstaviť ako techniku "premysli si to krok za krokom", ale iterujúcu cez vaše zdroje údajov!

### Začíname

Najjednoduchší spôsob, ako začať vyskúšať Dotazný engine pre podotázky, je spustiť súbor subquestion.ts v [príkladoch](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Nástroje

Dotazný engine pre podotázky je implementovaný pomocou nástrojov. Základná myšlienka nástrojov je, že sú vykonateľné možnosti pre veľký jazykový model. V tomto prípade sa náš dotazný engine pre podotázky spolieha na nástroj QueryEngineTool, ktorý, ako už názov napovedá, je nástrojom na vykonávanie dotazov na dotazný engine. To nám umožňuje modelu poskytnúť možnosť vyhľadávať rôzne dokumenty pre rôzne otázky, napríklad. Môžete si tiež predstaviť, že dotazný engine pre podotázky môže používať nástroj, ktorý vyhľadáva niečo na webe alebo získava odpoveď pomocou Wolfram Alpha.

Viac sa dozviete o nástrojoch, ak sa pozriete do dokumentácie LlamaIndex Python https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API Referencia

- [RetrieverQueryEngine (Dotazný modul pre získavanie)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Dotazný modul pre podotázky)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Nástroj dotazného modulu)](../../api/interfaces/QueryEngineTool.md)

"
