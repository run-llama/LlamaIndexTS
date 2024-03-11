---
sidebar_position: 4
---

# Esempi end-to-end

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Includiamo diversi esempi end-to-end utilizzando LlamaIndex.TS nel repository.

Controlla gli esempi di seguito o provale e completale in pochi minuti con i tutorial interattivi di Github Codespace forniti da Dev-Docs [qui](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Motore di chat](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Leggi un file e chatta al riguardo con il LLM.

## [Indice vettoriale](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Crea un indice vettoriale e interrogalo. L'indice vettoriale utilizzerà le embedding per recuperare i nodi più rilevanti in cima k. Per impostazione predefinita, il valore di k è 2.

## [Indice di riepilogo](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Crea un indice di elenco e interrogalo. Questo esempio utilizza anche il `LLMRetriever`, che utilizzerà LLM per selezionare i migliori nodi da utilizzare durante la generazione della risposta.

## [Salva / Carica un indice](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Crea e carica un indice vettoriale. La persistenza su disco in LlamaIndex.TS avviene automaticamente una volta creato un oggetto di contesto di archiviazione.

## [Indice vettoriale personalizzato](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Crea un indice vettoriale e interrogalo, configurando anche il `LLM`, il `ServiceContext` e il `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Crea un OpenAI LLM e utilizzalo direttamente per la chat.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Crea un Llama-2 LLM e utilizzalo direttamente per la chat.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Utilizza il `SubQuestionQueryEngine`, che suddivide le query complesse in diverse domande e quindi aggrega una risposta tra le risposte a tutte le sotto-domande.

"

## [Moduli a basso livello](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Questo esempio utilizza diversi componenti a basso livello, che eliminano la necessità di un motore di interrogazione effettivo. Questi componenti possono essere utilizzati ovunque, in qualsiasi applicazione, o personalizzati e sottoclassificati per soddisfare le tue esigenze.
