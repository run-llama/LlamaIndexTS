---
sidebar_position: 3
---

# Užklausos variklis (QueryEngine)

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Užklausos variklis apgaubia `Retriever` ir `ResponseSynthesizer` į vieną grandinę, kuri naudos užklausos eilutę, kad gautų mazgus ir tada juos siųstų į LLM, kad sugeneruotų atsakymą.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("užklausos eilutė");
```

## Subklausimo užklausos variklis

Subklausimo užklausos variklio pagrindinė koncepcija yra tai, kad jis padalina vieną užklausą į kelias užklausas, gauna atsakymą į kiekvieną iš tų užklausų ir tada sujungia skirtingus atsakymus į vientisą atsakymą vartotojui. Galite tai įsivaizduoti kaip "galvokite apie tai žingsnis po žingsnio" techniką, bet iteruojant per savo duomenų šaltinius!

### Pradžia

Paprastiausias būdas pradėti išbandyti Subklausimo užklausos variklį yra paleisti subquestion.ts failą [pavyzdžiuose](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Įrankiai

Subklausimo užklausos variklis yra įgyvendintas su įrankiais. Įrankių pagrindinė idėja yra tai, kad jie yra vykdomi variantai didelio kalbos modelio atžvilgiu. Šiuo atveju mūsų subklausimo užklausos variklis remiasi QueryEngineTool, kuris, kaip jau supratote, yra įrankis, skirtas vykdyti užklausas QueryEngine. Tai leidžia mums suteikti modeliui galimybę užklausti skirtingus dokumentus skirtingiems klausimams, pavyzdžiui. Taip pat galite įsivaizduoti, kad subklausimo užklausos variklis gali naudoti įrankį, kuris ieško kažko internete arba gauna atsakymą naudojant Wolfram Alpha.

Daugiau apie įrankius galite sužinoti peržiūrėję LlamaIndex Python dokumentaciją https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## API nuorodos

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
