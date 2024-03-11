---
sidebar_position: 3
---

# QueryEngine (Spørringsmotor)

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

En spørringsmotor pakker inn en `Retriever` og en `ResponseSynthesizer` i en pipeline, som vil bruke spørringsstrengen til å hente noder og deretter sende dem til LLM for å generere et svar.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("spørringsstreng");
```

## Under-spørsmål Spørringsmotor

Det grunnleggende konseptet med Under-spørsmål Spørringsmotoren er at den deler opp en enkelt spørring i flere spørringer, får et svar for hver av disse spørringene, og kombinerer deretter de forskjellige svarene til en sammenhengende respons for brukeren. Du kan tenke på det som en "tenk grundig gjennom" teknikk, men med iterasjon over datakildene dine!

### Komme i gang

Den enkleste måten å begynne å prøve Under-spørsmål Spørringsmotoren på er å kjøre subquestion.ts-filen i [eksemplene](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Verktøy

Under-spørsmål Spørringsmotoren er implementert med Verktøy. Den grunnleggende ideen med Verktøy er at de er utførbare alternativer for det store språkmodellen. I dette tilfellet er vår Under-spørsmål Spørringsmotor avhengig av QueryEngineTool, som som du kanskje har gjettet, er et verktøy for å kjøre spørringer på en Spørringsmotor. Dette gjør det mulig for oss å gi modellen muligheten til å spørre forskjellige dokumenter for forskjellige spørsmål, for eksempel. Du kan også forestille deg at Under-spørsmål Spørringsmotoren kan bruke et Verktøy som søker etter noe på nettet eller får et svar ved hjelp av Wolfram Alpha.

Du kan lære mer om Verktøy ved å se på LlamaIndex Python-dokumentasjonen https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API-referanse

- [RetrieverQueryEngine (RetrieverSpørringsmotor)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (UnderSpørsmålSpørringsmotor)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (SpørringsmotorVerktøy)](../../api/interfaces/QueryEngineTool.md)

"
