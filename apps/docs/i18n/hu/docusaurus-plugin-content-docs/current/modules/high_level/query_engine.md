---
sidebar_position: 3
---

# QueryEngine (Lekérdezési motor)

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A lekérdezési motor egy `Retriever` és egy `ResponseSynthesizer` objektumot csomagol be egy csővezetékbe, amely a lekérdezési karakterláncot használja a csomópontok lekérdezésére, majd elküldi azokat az LLM-nek a válasz generálásához.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("lekérdezési karakterlánc");
```

## Alkérdés lekérdezési motor (Sub Question Query Engine)

Az Alkérdés lekérdezési motor alapvető koncepciója az, hogy egyetlen lekérdezést több lekérdezésre bont, minden egyes lekérdezésre választ kap, majd ezeket a különböző válaszokat egyetlen koherens válaszként kombinálja a felhasználó számára. Gondolhat rá, mint a "gondolja végig lépésről lépésre" módszerre, amikor az adatforrásokon iterál!

### Első lépések

A legegyszerűbb módja annak, hogy elkezdje kipróbálni az Alkérdés lekérdezési motort, az [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts) mappában található subquestion.ts fájl futtatása.

```bash
npx ts-node subquestion.ts
```

"

### Eszközök

Az Alkérdés lekérdezési motor eszközökkel van implementálva. Az eszközök alapötlete az, hogy végrehajtható lehetőségek a nagy nyelvi modell számára. Ebben az esetben az Alkérdés lekérdezési motorunk a QueryEngineTool-ra támaszkodik, amely, ahogy már sejthetted, egy eszköz a lekérdezések futtatásához egy QueryEngine-en. Ez lehetővé teszi számunkra, hogy a modellnek lehetőséget adjunk arra, hogy különböző kérdésekre különböző dokumentumokat kérdezzen le például. Elképzelhető, hogy az Alkérdés lekérdezési motor használhat egy eszközt, amely a weben való keresésre vagy válaszok szerzésére használja a Wolfram Alpha-t.

További információkat az eszközökről a LlamaIndex Python dokumentációjában találhatsz: https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API referencia

- [RetrieverQueryEngine (Lekérdező lekérdezési motor)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Alkérdés lekérdezési motor)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Lekérdezési motor eszköz)](../../api/interfaces/QueryEngineTool.md)

"
