---
sidebar_position: 3
---

# QueryEngine

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

En query engine pakker en `Retriever` og en `ResponseSynthesizer` ind i en pipeline, der vil bruge query strengen til at hente noder og derefter sende dem til LLM for at generere et svar.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("query streng");
```

## Underforespørgselsmotor (Sub Question Query Engine)

Det grundlæggende koncept for Underforespørgselsmotoren er, at den opdeler en enkelt forespørgsel i flere forespørgsler, får et svar på hver af disse forespørgsler og kombinerer derefter disse forskellige svar til et enkelt sammenhængende svar til brugeren. Du kan tænke på det som teknikken "tænk dette igennem trin for trin", men hvor du itererer over dine datakilder!

### Kom godt i gang

Den nemmeste måde at begynde at prøve Underforespørgselsmotoren er at køre filen subquestion.ts i [eksemplerne](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Værktøjer (Tools)

Underforespørgselsmotoren er implementeret med værktøjer (Tools). Den grundlæggende idé med værktøjer er, at de er eksekverbare muligheder for det store sprogmodel. I dette tilfælde er vores Underforespørgselsmotor afhængig af QueryEngineTool, som som du nok gættede, er et værktøj til at køre forespørgsler på en QueryEngine. Dette giver os mulighed for at give modellen mulighed for at forespørge forskellige dokumenter til forskellige spørgsmål, for eksempel. Du kan også forestille dig, at Underforespørgselsmotoren kan bruge et værktøj, der søger efter noget på nettet eller får et svar ved hjælp af Wolfram Alpha.

Du kan lære mere om værktøjer ved at kigge på LlamaIndex Python-dokumentationen [her](https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html).

## API Reference

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md) (RetrieverQueryEngine)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md) (SubQuestionQueryEngine)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md) (QueryEngineTool)
