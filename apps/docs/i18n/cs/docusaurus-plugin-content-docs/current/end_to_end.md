---
sidebar_position: 4
---

# Příklady od začátku do konce

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

V repozitáři jsou k dispozici několik příkladů od začátku do konce, které používají LlamaIndex.TS.

Podívejte se na následující příklady nebo je vyzkoušejte a dokončete je během několika minut s interaktivními tutoriály na Github Codespace poskytovanými Dev-Docs [zde](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chatovací engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Načtěte soubor a diskutujte o něm s LLM.

## [Vektorový index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Vytvořte vektorový index a vyhledejte v něm. Vektorový index používá vnoření pro získání nejrelevantnějších uzlů. Výchozí hodnota pro nejrelevantnější uzly je 2.

"

## [Index shrnutí](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Vytvořte seznamový index a vyhledejte v něm. Tento příklad také používá `LLMRetriever`, který používá LLM k výběru nejlepších uzlů pro generování odpovědi.

"

## [Uložení / Načtení indexu](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Vytvoření a načtení vektorového indexu. Ukládání na disk v LlamaIndex.TS se provádí automaticky poté, co je vytvořen objekt kontextu úložiště.

"

## [Přizpůsobený vektorový index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Vytvořte vektorový index a dotazujte se na něj, přičemž také konfigurujte `LLM`, `ServiceContext` a `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Vytvořte OpenAI LLM a použijte ho přímo pro chatování.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Vytvořte Llama-2 LLM a použijte jej přímo pro chatování.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Používá `SubQuestionQueryEngine`, který rozděluje složité dotazy na více poddotazů a poté agreguje odpověď na všechny poddotazy.

"

## [Moduly nízké úrovně](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Tento příklad používá několik modulů nízké úrovně, což odstraňuje potřebu skutečného dotazovacího enginu. Tyto moduly lze použít kdekoli, v jakékoliv aplikaci, nebo je lze upravit a podřadit, aby vyhovovaly vašim vlastním potřebám.
