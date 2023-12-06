---
sidebar_position: 3
---

# QueryEngine (Kyselymoottori)

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

Kyselymoottori käärii `Retriever`-objektin ja `ResponseSynthesizer`-objektin putkeen, joka käyttää kyselymerkkijonoa hakeakseen solmuja ja lähettää ne sitten LLM:lle vastauksen generoimiseksi.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("kyselymerkkijono");
```

## Alakysymyskyselymoottori

Alakysymyskyselymoottorin perusajatus on jakaa yksi kysely useiksi kyselyiksi, saada vastaus jokaiseen näistä kyselyistä ja sitten yhdistää nämä erilaiset vastaukset yhdeksi johdonmukaiseksi vastaukseksi käyttäjälle. Voit ajatella sitä "ajattele tämä läpi vaihe vaiheelta" -tekniikkana, jossa käydään läpi tietolähteitä!

### Aloittaminen

Helpoin tapa aloittaa Alakysymyskyselymoottorin kokeileminen on ajaa subquestion.ts-tiedosto [esimerkeissä](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Työkalut

Alakysymyskyselymoottori on toteutettu työkalujen avulla. Työkalujen perusajatus on, että ne ovat suoritettavia vaihtoehtoja suurelle kielimallille. Tässä tapauksessa alakysymyskyselymoottorimme perustuu QueryEngineTooliin, joka, kuten arvasitkin, on työkalu kyselyjen suorittamiseen kyselymoottorilla. Tämä mahdollistaa sen, että voimme antaa mallille mahdollisuuden kysyä eri asiakirjoja eri kysymyksiin esimerkiksi. Voit myös kuvitella, että alakysymyskyselymoottori voi käyttää työkalua, joka etsii jotain verkosta tai saa vastauksen käyttäen Wolfram Alphaa.

Voit oppia lisää työkaluista tutustumalla LlamaIndex Python -dokumentaatioon: https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API-viite

- [RetrieverQueryEngine (Hakumoottorin kyselymoottori)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Alakysymyksen kyselymoottori)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Kyselymoottorin työkalu)](../../api/interfaces/QueryEngineTool.md)

"
