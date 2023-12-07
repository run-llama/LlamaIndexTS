---
sidebar_position: 3
---

# QueryEngine (Vaicājumu dzinējs)

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Vaicājumu dzinējs ietver "Retriever" un "ResponseSynthesizer" komponentes vienā plūsmā, kas izmanto vaicājuma virkni, lai iegūtu mezglus un pēc tam nosūtītu tos LLM, lai ģenerētu atbildi.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("vaicājuma virkne");
```

## Apakšjautājumu dzinējs

Apakšjautājumu dzinēja pamatideja ir sadalīt vienu vaicājumu vairākos vaicājumos, iegūt atbildi uz katru no šiem vaicājumiem un pēc tam apvienot atšķirīgās atbildes vienā saprotamā atbildē lietotājam. To varētu uzskatīt par "padomāt soli pa solim" tehniku, iterējot pār datu avotiem!

### Sākumā

Vienkāršākais veids, kā sākt izmēģināt Apakšjautājumu vaicājumu dzinēju, ir palaist subquestion.ts failu [piemēros](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Rīki

Apakšjautājumu dzinējs ir ieviests ar rīkiem. Rīku pamatideja ir tā, ka tie ir izpildāmas opcijas lielajam valodas modelim. Šajā gadījumā mūsu Apakšjautājumu dzinējs balstās uz QueryEngineTool, kas, kā jūs jau minējāt, ir rīks, lai izpildītu vaicājumus QueryEngine. Tas ļauj mums dot modeļam iespēju vaicāt dažādus dokumentus dažādiem jautājumiem, piemēram. Jūs varētu iedomāties, ka Apakšjautājumu dzinējs varētu izmantot rīku, kas meklē kaut ko tīmeklī vai iegūst atbildi, izmantojot Wolfram Alpha.

Uzziniet vairāk par rīkiem, apskatot LlamaIndex Python dokumentāciju: https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## API atsauce

- [RetrieverQueryEngine (Atgūtāja vaicājumu dzinējs)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Apakšjautājumu vaicājumu dzinējs)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Vaicājumu dzinēja rīks)](../../api/interfaces/QueryEngineTool.md)
