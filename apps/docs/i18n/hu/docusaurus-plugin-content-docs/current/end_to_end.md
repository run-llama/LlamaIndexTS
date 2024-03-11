---
sidebar_position: 4
---

# Végponttól végpontig példák

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

Több végponttól végpontig példát tartalmazunk a LlamaIndex.TS használatával a repository-ban.

Tekintse meg az alábbi példákat, vagy próbálja ki őket, és fejezze be őket percek alatt interaktív Github Codespace oktatókkal, amelyeket a Dev-Docs nyújt [itt](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Olvasson be egy fájlt és beszéljen róla a LLM-mel.

## [Vektor Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Hozzon létre egy vektor indexet és kérdezze le. A vektor index beágyazásokat fog használni a legfontosabb k legrelevánsabb csomópont lekérdezéséhez. Alapértelmezés szerint a legfontosabb k értéke 2.

"

## [Összefoglaló Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Hozzon létre egy listát és kérdezze le. Ez a példa használja a `LLMRetriever`-t is, amely a LLM-et használja a legjobb csomópontok kiválasztásához a válasz generálásakor.

"

## [Index Mentése / Betöltése](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Hozzon létre és töltse be egy vektor indexet. A LlamaIndex.TS-ben a perzisztencia automatikusan megtörténik, amint létrejön egy tárolási kontextus objektum.

"

## [Egyéni Vektor Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Hozzon létre egy vektor indexet és kérdezze le, miközben konfigurálja a `LLM`-et, a `ServiceContext`-et és a `similarity_top_k`-t.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Hozzon létre egy OpenAI LLM-et és használja közvetlenül a csevegéshez.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Hozzon létre egy Llama-2 LLM-et, és használja közvetlenül a csevegéshez.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Használja a `SubQuestionQueryEngine`-t, amely bonyolult lekérdezéseket több részre bont, majd összeállít egy választ az összes részlekérdezésre adott válasz alapján.

"

## [Alacsony szintű modulok](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Ez a példa több alacsony szintű komponenst használ, amelyek eltávolítják a tényleges lekérdezési motor szükségességét. Ezeket a komponenseket bárhol használhatja, bármilyen alkalmazásban, vagy testreszabhatja és részleges osztályokká alakíthatja őket a saját igényei szerint.
