---
sidebar_position: 3
---

# QueryEngine

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

Een query-engine wikkelt een `Retriever` en een `ResponseSynthesizer` in een pijplijn, die de queryreeks zal gebruiken om knooppunten op te halen en deze vervolgens naar de LLM stuurt om een ​​reactie te genereren.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("queryreeks");
```

## Subvraag Query Engine

Het basisconcept van de Subvraag Query Engine is dat het een enkele query opsplitst in meerdere queries, voor elke query een antwoord krijgt en vervolgens die verschillende antwoorden combineert tot een samenhangende reactie voor de gebruiker. Je kunt het zien als de techniek van "denk hier stap voor stap over na" maar dan met iteratie over je gegevensbronnen!

### Aan de slag

De gemakkelijkste manier om de Subvraag Query Engine uit te proberen, is door het bestand subquestion.ts uit te voeren in [voorbeelden](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Tools

SubQuestionQueryEngine is geïmplementeerd met Tools. Het basisidee van Tools is dat het uitvoerbare opties zijn voor het grote taalmodel. In dit geval vertrouwt onze SubQuestionQueryEngine op QueryEngineTool, dat zoals je al geraden hebt een tool is om queries uit te voeren op een QueryEngine. Dit stelt ons in staat om het model de mogelijkheid te geven om verschillende documenten te bevragen voor verschillende vragen, bijvoorbeeld. Je kunt je ook voorstellen dat de SubQuestionQueryEngine een Tool kan gebruiken die iets op het web zoekt of een antwoord krijgt met behulp van Wolfram Alpha.

Je kunt meer te weten komen over Tools door te kijken naar de LlamaIndex Python-documentatie op https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API Referentie

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
