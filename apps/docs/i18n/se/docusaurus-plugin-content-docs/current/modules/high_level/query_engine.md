---
sidebar_position: 3
---

# QueryEngine (Upitni motor)

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

QueryEngine (Upitni motor) obuhvata `Retriever` i `ResponseSynthesizer` u cevovodu, koji će koristiti upitni niz za dohvat čvorova, a zatim ih poslati LLM-u da generiše odgovor.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("upitni niz");
```

## Podupitni upitni motor

Osnovna ideja podupitnog upitnog motora je da podeli jedan upit na više upita, dobije odgovor za svaki od tih upita, a zatim kombinuje te različite odgovore u jedan koherentan odgovor za korisnika. Možete ga zamisliti kao tehniku "razmišljanja korak po korak" ali iteriranje kroz izvore podataka!

### Početak rada

Najlakši način da počnete da koristite Upitni motor za podpitanja je pokretanje fajla subquestion.ts u [primerima](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Alati

Podupitni upitni motor je implementiran sa Alatima. Osnovna ideja Alata je da su to izvršne opcije za veliki jezički model. U ovom slučaju, naš podupitni upitni motor se oslanja na QueryEngineTool, koji je, kao što ste pretpostavili, alat za pokretanje upita na QueryEngine-u. To nam omogućava da modelu damo opciju da upita različite dokumente za različita pitanja, na primer. Takođe možete zamisliti da podupitni upitni motor može koristiti Alat koji traži nešto na vebu ili dobija odgovor koristeći Wolfram Alpha.

Više o Alatima možete saznati tako što ćete pogledati LlamaIndex Python dokumentaciju na sledećem linku: https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API Reference (API referenca)

- [RetrieverQueryEngine (Motor za dohvat upita)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Motor za podupit)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Alat za upitni motor)](../../api/interfaces/QueryEngineTool.md)

"
