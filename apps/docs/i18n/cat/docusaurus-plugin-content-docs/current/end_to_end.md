---
sidebar_position: 4
---

# Exemples de principi a fi

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

Incluïm diversos exemples de principi a fi utilitzant LlamaIndex.TS en el repositori.

Comproveu els exemples a continuació o proveu-los i completeu-los en qüestió de minuts amb els tutorials interactius de Github Codespace proporcionats per Dev-Docs [aquí](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Motor de xat](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Llegeix un fitxer i xerra sobre això amb el LLM.

## [Índex de vectors](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Creeu un índex de vectors i consulteu-lo. L'índex de vectors utilitzarà incrustacions per obtenir els nodes més rellevants més importants. Per defecte, els nodes més importants són 2.

"

## [Índex de resum](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Creeu un índex de llista i consulteu-lo. Aquest exemple també utilitza el `LLMRetriever`, que utilitzarà el LLM per seleccionar els millors nodes a utilitzar en la generació de la resposta.

"

## [Guardar / Carregar un Índex](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Creeu i carregueu un índex de vectors. La persistència al disc en LlamaIndex.TS es produeix automàticament una vegada que es crea un objecte de context d'emmagatzematge.

## [Índex de vectors personalitzat](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Creeu un índex de vectors i consulteu-lo, mentre configureu el `LLM`, el `ServiceContext` i el `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Crea un OpenAI LLM i utilitza'l directament per a xatejar.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Crea un Llama-2 LLM i utilitza'l directament per a xatejar.

"

## [Motor de consulta de subpreguntes](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Utilitza el `Motor de consulta de subpreguntes`, que descompon les consultes complexes en múltiples preguntes i després agrega una resposta a través de les respostes a totes les subpreguntes.

"

## [Mòduls de baix nivell](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Aquest exemple utilitza diversos components de baix nivell, el que elimina la necessitat d'un motor de consulta real. Aquests components es poden utilitzar en qualsevol lloc, en qualsevol aplicació, o personalitzar i sub-classificar per satisfer les vostres pròpies necessitats.

"
