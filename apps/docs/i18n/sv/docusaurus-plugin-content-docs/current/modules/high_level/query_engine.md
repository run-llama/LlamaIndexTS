---
sidebar_position: 3
---

# QueryEngine (Frågemotor)

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

En frågemotor omsluter en `Retriever` och en `ResponseSynthesizer` i en pipeline, som kommer att använda frågesträngen för att hämta noder och sedan skicka dem till LLM för att generera ett svar.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("frågesträng");
```

## Underfrågefrågemotor

Den grundläggande tanken med Underfrågefrågemotorn är att dela upp en enda fråga i flera frågor, få ett svar för var och en av dessa frågor och sedan kombinera dessa olika svar till ett sammanhängande svar för användaren. Du kan tänka på det som tekniken "tänk igenom detta steg för steg" men genom att iterera över dina datakällor!

### Komma igång

Det enklaste sättet att börja prova Underfrågefrågemotorn är att köra filen subquestion.ts i [exempel](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Verktyg

Underfrågefrågemotorn implementeras med hjälp av Verktyg. Den grundläggande idén med Verktyg är att de är körbara alternativ för det stora språkmodellen. I det här fallet förlitar sig vår Underfrågefrågemotor på QueryEngineTool, som som du kanske gissat är ett verktyg för att köra frågor på en frågemotor. Detta gör att vi kan ge modellen möjlighet att fråga olika dokument för olika frågor till exempel. Du kan också tänka dig att Underfrågefrågemotorn kan använda ett verktyg som söker efter något på webben eller får ett svar med hjälp av Wolfram Alpha.

Du kan lära dig mer om Verktyg genom att titta på LlamaIndex Python-dokumentationen https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## API-referens

- [RetrieverQueryEngine (RetrieverFrågemotor)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (UnderfrågaFrågemotor)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (FrågemotorVerktyg)](../../api/interfaces/QueryEngineTool.md)
