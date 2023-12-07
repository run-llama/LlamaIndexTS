---
sidebar_position: 3
---

# QueryEngine (Motore di Query)

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Un motore di query avvolge un `Retriever` e un `ResponseSynthesizer` in una pipeline, che utilizzerà la stringa di query per recuperare i nodi e quindi inviarli al LLM per generare una risposta.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("stringa di query");
```

## Motore di Query per Sotto-Domande

Il concetto di base del Motore di Query per Sotto-Domande è che suddivide una singola query in più query, ottiene una risposta per ciascuna di queste query e quindi combina queste diverse risposte in una singola risposta coerente per l'utente. Puoi pensarlo come la tecnica di "pensare passo dopo passo" ma iterando sulle tue fonti di dati!

### Per iniziare

Il modo più semplice per iniziare a provare il Motore di Query per Sotto-Domande è eseguire il file subquestion.ts in [esempi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Strumenti

Il Motore di Query per Sotto-Domande è implementato con Strumenti. L'idea di base degli Strumenti è che siano opzioni eseguibili per il grande modello di linguaggio. In questo caso, il nostro Motore di Query per Sotto-Domande si basa su QueryEngineTool, che come avrai intuito è uno strumento per eseguire query su un Motore di Query. Ciò ci consente di fornire al modello un'opzione per interrogare documenti diversi per domande diverse, ad esempio. Potresti immaginare anche che il Motore di Query per Sotto-Domande possa utilizzare uno Strumento che cerca qualcosa sul web o ottiene una risposta utilizzando Wolfram Alpha.

Puoi saperne di più sugli Strumenti consultando la documentazione di LlamaIndex Python su https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## Riferimento API

- [RetrieverQueryEngine (Motore di Query del Recuperatore)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Motore di Query delle Sotto-domande)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Strumento del Motore di Query)](../../api/interfaces/QueryEngineTool.md)

"
