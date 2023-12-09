---
sidebar_position: 3
---

# Augstā līmeņa koncepti

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

LlamaIndex.TS palīdz jums veidot LLM jaudīgas lietojumprogrammas (piemēram, jautājumu un atbilžu sistēmu, čatbota) ar pielāgotiem datiem.

Šajā augstā līmeņa konceptu rokasgrāmatā jūs iemācīsieties:

- kā LLM var atbildēt uz jautājumiem, izmantojot jūsu pašu datus.
- galvenos jēdzienus un moduļus LlamaIndex.TS, lai veidotu savu vaicājumu plūsmu.

## Jautājumu atbildēšana pār jūsu datiem

LlamaIndex izmanto divu posmu metodi, izmantojot LLM ar jūsu datiem:

1. **indeksēšanas posms**: zināšanu bāzes sagatavošana, un
2. **vaicāšanas posms**: atbilstošā konteksta iegūšana no zināšanām, lai palīdzētu LLM atbildēt uz jautājumu.

![](./_static/concepts/rag.jpg)

Šo procesu sauc arī par atgūšanas papildinātu ģenerēšanu (RAG).

LlamaIndex.TS nodrošina būtiskos rīkus, lai abus soļus padarītu ļoti vienkāršus.

Apskatīsim katru posmu detalizēti.

### Indeksēšanas posms

LlamaIndex.TS palīdz jums sagatavot zināšanu bāzi, izmantojot datu savienotājus un indeksus.

![](./_static/concepts/indexing.jpg)

[**Datu ielādētāji**](./modules/high_level/data_loader.md):
Datu savienotājs (piemēram, `Reader`) iegūst datus no dažādiem datu avotiem un datu formātiem un pārveido tos par vienkāršu `Dokumenta` reprezentāciju (teksts un vienkārša metadati).

[**Dokumenti / mezgli**](./modules/high_level/documents_and_nodes.md): `Dokuments` ir vispārīgs konteiners jebkuram datu avotam - piemēram, PDF, API izvade vai atgūti dati no datu bāzes. `Mezgls` ir atomiskā datu vienība LlamaIndex un pārstāv "gabalu" no avota `Dokumenta`. Tas ir bagātīgs pārstājums, kas ietver metadatus un attiecības (ar citiem mezgliem), lai ļautu precīzas un izteiksmīgas atgūšanas operācijas.

[**Datu indeksi**](./modules/high_level/data_index.md):
Kad jūs esat ielādējis savus datus, LlamaIndex palīdz jums indeksēt datus tā, lai tos būtu viegli atgūt.

LlamaIndex apstrādā neapstrādātos dokumentus, pārveido tos par starpposmu reprezentācijām, aprēķina vektora iegultnes un saglabā jūsu datus atmiņā vai diskā.

"

### Vaicāšanas posms

Vaicāšanas posmā vaicājumu plūsma atgūst vispiemērotāko kontekstu, ņemot vērā lietotāja vaicājumu,
un nodod to LLM (kopā ar vaicājumu), lai sintezētu atbildi.

Tas nodrošina LLM ar aktuālām zināšanām, kas nav tās sākotnējā apmācības datu kopā,
(arī samazinot halucinācijas).

Galvenais izaicinājums vaicāšanas posmā ir atgūšana, orķestrēšana un loģika pār (iespējams, vairākām) zināšanu bāzēm.

LlamaIndex nodrošina komponējamus moduļus, kas palīdz jums veidot un integrēt RAG plūsmas jautājumu un atbilžu sistēmām (vaicājumu dzinējs), čatbotiem (čata dzinējs) vai kā daļu no aģenta.

Šīs būvēšanas bloki var tikt pielāgoti, lai atspoguļotu rangs iestatījumus, kā arī sastādīti, lai loģiski izvērtētu vairākas zināšanu bāzes.

![](./_static/concepts/querying.jpg)

#### Būvēšanas bloki

[**Atgūtāji**](./modules/low_level/retriever.md):
Atgūtājs definē, kā efektīvi atgūt atbilstošu kontekstu no zināšanu bāzes (piemēram, indeksa), ņemot vērā vaicājumu.
Konkrētā atgūšanas loģika atšķiras atkarībā no indeksiem, populārākais būdams blīva atgūšana pret vektora indeksu.

[**Atbildes sintezatori**](./modules/low_level/response_synthesizer.md):
Atbildes sintezators ģenerē atbildi no LLM, izmantojot lietotāja vaicājumu un atgūtu teksta fragmentu kopu.

"

#### Plūsmas

[**Vaicājumu dzinēji**](./modules/high_level/query_engine.md):
Vaicājumu dzinējs ir no sākuma līdz beigām plūsma, kas ļauj jums uzdot jautājumus par jūsu datiem.
Tas ņem vērā dabiskās valodas vaicājumu un atgriež atbildi, kopā ar atsauces kontekstu, kas iegūts un nodots LLM.

[**Čata dzinēji**](./modules/high_level/chat_engine.md):
Čata dzinējs ir no sākuma līdz beigām plūsma, kas ļauj jums veikt sarunu ar jūsu datiem
(vairākas abpusējas saziņas vietas vietā viena jautājuma un atbildes).

"
