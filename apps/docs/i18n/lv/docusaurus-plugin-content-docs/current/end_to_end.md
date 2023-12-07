---
sidebar_position: 4
---

# Galam līdz galam piemēri

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Mūsu repozitorijā ir iekļauti vairāki galam līdz galam piemēri, izmantojot LlamaIndex.TS

Apskatiet zemāk esošos piemērus vai izmēģiniet tos un pabeidziet tos dažu minūšu laikā, izmantojot interaktīvus Github Codespace pamācības, ko nodrošina Dev-Docs [šeit](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Čata dzinējs](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Nolasiet failu un sarunājieties par to ar LLM.

## [Vektora indekss](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Izveidojiet vektora indeksu un veiciet vaicājumu. Vektora indekss izmantos iegultās vērtības, lai iegūtu visaktualitākos k kaimiņus. Pēc noklusējuma, k vērtība ir 2.

"

## [Kopsavilkuma indekss](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Izveidojiet saraksta indeksu un veiciet vaicājumu. Šajā piemērā tiek izmantots arī `LLMRetriever`, kas izmanto LLM, lai izvēlētos labākos mezglus, kas jāizmanto, veidojot atbildi.

"

## [Saglabāt / Ielādēt indeksu](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Izveidojiet un ielādējiet vektora indeksu. LlamaIndex.TS automātiski saglabā datus diskā, kad tiek izveidots krātuves konteksta objekts.

"

## [Pielāgota vektora indekss](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Izveidojiet vektora indeksu un veiciet vaicājumu, konfigurējot arī `LLM`, `ServiceContext` un `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Izveidojiet OpenAI LLM un to izmantojiet tiešsaistes čatam.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Izveidojiet Llama-2 LLM un to izmantojiet tieši čatam.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Izmanto `SubQuestionQueryEngine`, kas sadala sarežģītas vaicājumus vairākos apakšjautājumos un pēc tam apkopo atbildes visu apakšjautājumu rezultātos.

"

## [Zemā līmeņa moduļi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Šis piemērs izmanto vairākus zemā līmeņa komponentus, kas novērš nepieciešamību pēc faktiskas vaicājumu dzinēja. Šos komponentus var izmantot jebkur, jebkurā lietotnē vai pielāgot un apakšklasēt, lai atbilstu jūsu pašu vajadzībām.

"
