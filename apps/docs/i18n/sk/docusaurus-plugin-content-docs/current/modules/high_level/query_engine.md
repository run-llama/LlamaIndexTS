---
sidebar_position: 3
---

# QueryEngine (Poizvedovalni pogon)

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Poizvedovalni pogon ovije `Retriever` in `ResponseSynthesizer` v cevovod, ki bo uporabil poizvedovalni niz za pridobivanje vozlišč in jih nato poslal v LLM za generiranje odgovora.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("poizvedovalni niz");
```

## Poizvedovalni pogon za podvprašanja

Osnovna ideja poizvedovalnega pogona za podvprašanja je, da razdeli eno poizvedbo na več poizvedb, pridobi odgovor za vsako od teh poizvedb in nato združi te različne odgovore v en sam koherenten odgovor za uporabnika. Lahko si predstavljate to kot tehniko "razmisli o tem korak za korakom", vendar z iteracijo po vaših virih podatkov!

### Začetek

Najlažji način za začetek preizkušanja podpogonskega poizvedbenega pogona je zagon datoteke subquestion.ts v mapi [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Orodja

Poizvedovalni pogon za podvprašanja je implementiran z orodji. Osnovna ideja orodij je, da so izvedljive možnosti za velik jezikovni model. V tem primeru se naš poizvedovalni pogon za podvprašanja zanaša na orodje QueryEngineTool, ki je, kot ste uganili, orodje za izvajanje poizvedb na poizvedovalnem pogonu. To nam omogoča, da modelu omogočimo možnost poizvedovanja različnih dokumentov za različna vprašanja, na primer. Prav tako si lahko predstavljate, da bi poizvedovalni pogon za podvprašanja lahko uporabil orodje, ki išče nekaj na spletu ali pridobi odgovor z uporabo Wolfram Alpha.

Več o orodjih lahko izveste, če si ogledate dokumentacijo za Python LlamaIndex na naslovu https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API Referenca

- [RetrieverQueryEngine (Poizvedovalni pogon pridobitelja)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Poizvedovalni pogon podvprašanja)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Orodje za poizvedovalni pogon)](../../api/interfaces/QueryEngineTool.md)
