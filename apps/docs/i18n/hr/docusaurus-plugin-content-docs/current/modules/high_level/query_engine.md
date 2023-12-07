---
sidebar_position: 3
---

# QueryEngine (Upitni motor)

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

Upitni motor obuhvaća `Retriever` i `ResponseSynthesizer` u cjevovodu koji će koristiti upitni niz za dohvaćanje čvorova, a zatim ih poslati LLM-u kako bi generirao odgovor.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("upitni niz");
```

## Upitni motor za podupit (Sub Question Query Engine)

Osnovna ideja Upitnog motora za podupit je da razdvoji jedan upit na više upita, dobije odgovor za svaki od tih upita, a zatim kombinira te različite odgovore u jedan koherentan odgovor za korisnika. Možete ga zamisliti kao tehniku "razmišljanja korak po korak" ali iteriranje kroz izvore podataka!

### Početak rada

Najjednostavniji način za početak isprobavanja Upitnog motora za podupitna pitanja je pokretanje datoteke subquestion.ts u [primjerima](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Alati

Upitni motor za podupit je implementiran pomoću Alata. Osnovna ideja Alata je da su izvršne opcije za veliki jezični model. U ovom slučaju, naš Upitni motor za podupit oslanja se na QueryEngineTool, koji je, kako ste pretpostavili, alat za izvođenje upita na Upitnom motoru. To nam omogućuje da modelu pružimo mogućnost upita različitih dokumenata za različita pitanja, na primjer. Također možete zamisliti da Upitni motor za podupit može koristiti Alat koji traži nešto na webu ili dobiva odgovor pomoću Wolfram Alpha.

Više o Alatima možete saznati pogledavajući LlamaIndex Python dokumentaciju na https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API Referenca

- [RetrieverQueryEngine (Retriever upitni motor)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Upitni motor za podpitanja)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Alat za upitni motor)](../../api/interfaces/QueryEngineTool.md)

"
