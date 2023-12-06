---
sidebar_position: 3
---

# QueryEngine (Päringumootor)

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

Päringumootor ümbritseb `Retriever`-i ja `ResponseSynthesizer`-i torustikku, mis kasutab päringu stringi sõlmede toomiseks ja seejärel saadab need LLM-ile vastuse genereerimiseks.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("päringu string");
```

## Alampäringu päringumootor

Alampäringu päringumootori põhikontseptsioon seisneb ühe päringu jagamises mitmeks päringuks, vastuse saamises iga päringu jaoks ning nende erinevate vastuste ühendamises ühtseks arusaadavaks vastuseks kasutajale. Võite seda kujutada ette kui "mõtle seda samm-sammult läbi" meetodit, kuid andmeallikate üle iteratsiooniga!

### Alustamine

Lihtsaim viis alampäringu päringumootori proovimiseks on käivitada subquestion.ts fail [näidetes](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Tööriistad

Alampäringu päringumootor on rakendatud tööriistadega. Tööriistade põhiline idee seisneb selles, et need on käivitatavad valikud suurele keelemudelile. Selles konkreetses juhul sõltub meie alampäringu päringumootor QueryEngineTool-ist, mis, nagu arvata võite, on tööriist päringute käitamiseks päringumootoris. See võimaldab meil mudelile anda võimaluse erinevate küsimuste jaoks pärida erinevaid dokumente. Võite ka ette kujutada, et alampäringu päringumootor võiks kasutada tööriista, mis otsib midagi veebist või saab vastuse Wolfram Alpha abil.

Tööriistade kohta saate rohkem teavet, vaadates LlamaIndex Pythoni dokumentatsiooni aadressil https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## API viide

- [RetrieverQueryEngine (Retrieveri päringumootor)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Alamküsimuse päringumootor)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Päringumootori tööriist)](../../api/interfaces/QueryEngineTool.md)
