---
sidebar_position: 3
---

# Aukšto lygio sąvokos

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

LlamaIndex.TS padeda jums kurti LLM pagrįstas aplikacijas (pvz., klausimų ir atsakymų sistema, chatbot'as) naudojant pasirinktinius duomenis.

Šiame aukšto lygio sąvokų vadove sužinosite:

- kaip LLM gali atsakyti į klausimus naudojant jūsų pačių duomenis.
- pagrindines sąvokas ir modulius LlamaIndex.TS, skirtus sudaryti savo užklausų grandinėms.

## Klausimų atsakymas naudojant jūsų duomenis

LlamaIndex naudoja dviejų etapų metodą, naudojant LLM su jūsų duomenimis:

1. **indeksavimo etapas**: pasiruošimas žinių bazei ir
2. **užklausos etapas**: atitinkamos konteksto iš žinių paieška, kad padėtų LLM atsakyti į klausimą

![](./_static/concepts/rag.jpg)

Šis procesas taip pat žinomas kaip "Retrieval Augmented Generation" (RAG).

LlamaIndex.TS suteikia esminį įrankių rinkinį, kuris padaro abu žingsnius labai paprastus.

Išsamiau išnagrinėkime kiekvieną etapą.

### Indeksavimo etapas

LlamaIndex.TS padeda jums paruošti žinių bazę su duomenų jungiklių ir indeksų rinkiniu.

![](./_static/concepts/indexing.jpg)

[**Duomenų įkėlėjai**](./modules/high_level/data_loader.md):
Duomenų jungiklis (t.y. `Reader`) įkelia duomenis iš įvairių duomenų šaltinių ir duomenų formatų į paprastą `Document` atstovavimą (tekstą ir paprastą metaduomenų).

[**Dokumentai / Mazgai**](./modules/high_level/documents_and_nodes.md): `Document` yra bendrinis konteineris, apimančio bet kokį duomenų šaltinį - pavyzdžiui, PDF, API išvestį arba gautus duomenis iš duomenų bazės. `Node` yra atomiškas duomenų vienetas LlamaIndex ir atstovauja "gabalui" iš šaltinio `Document`. Tai turtingas atstovavimas, kuris apima metaduomenis ir ryšius (su kitais mazgais), kad būtų galima atlikti tikslų ir išraiškingą atkūrimo operacijas.

[**Duomenų indeksai**](./modules/high_level/data_index.md):
Kai įkėlėte savo duomenis, LlamaIndex padeda jums indeksuoti duomenis į lengvai atkurtiną formatą.

Po dangčio LlamaIndex analizuoja žalius dokumentus į tarpinį atstovavimą, skaičiuoja vektorinius įdėlius ir saugo jūsų duomenis atmintyje ar diske.

"

### Užklausos etapas

Užklausos etape užklausos grandinė gauna aktualiausią kontekstą pagal vartotojo užklausą
ir perduoda jį LLM (kartu su užklausa), kad būtų sintezuotas atsakymas.

Tai suteikia LLM naujausias žinias, kurios nėra jo pradinėje mokymo duomenų rinkinyje,
(taip pat sumažinant halucinaciją).

Pagrindinis iššūkis užklausos etape yra žinių paieška, orkestro organizavimas ir apmąstymas per (galbūt daugelį) žinių pagrindų.

LlamaIndex suteikia suderinamus modulius, kurie padeda jums kurti ir integruoti RAG grandines klausimams ir atsakymams (užklausų variklis), chatbot'ams (pokalbių variklis) arba kaip dalį agento.

Šie statybiniai blokai gali būti pritaikomi atspindėti reitingavimo nuostatas, taip pat suderinti apmąstymui per kelis žinių pagrindus struktūrizuotu būdu.

![](./_static/concepts/querying.jpg)

#### Statybiniai blokai

[**Gavėjai**](./modules/low_level/retriever.md):
Gavėjas apibrėžia, kaip efektyviai gauti aktualų kontekstą iš žinių pagrindo (t.y. indekso), kai pateikiama užklausa.
Konkrečios gavimo logikos skiriasi priklausomai nuo indeksų, populiariausias būdamas tankus gavimas pagal vektorinį indeksą.

[**Atsakymo sintezatoriai**](./modules/low_level/response_synthesizer.md):
Atsakymo sintezatorius generuoja atsakymą iš LLM, naudodamas vartotojo užklausą ir nurodytą rinkinį gautų teksto fragmentų.

"

#### Grandinės

[**Užklausų varikliai**](./modules/high_level/query_engine.md):
Užklausų variklis yra nuo pradžios iki pabaigos grandinė, kuri leidžia jums užduoti klausimus apie savo duomenis.
Jis priima natūralios kalbos užklausą ir grąžina atsakymą kartu su gautu ir perduotu kontekstu LLM.

[**Pokalbių varikliai**](./modules/high_level/chat_engine.md):
Pokalbių variklis yra nuo pradžios iki pabaigos grandinė, skirta pokalbiui su jūsų duomenimis
(daugybė dialogų, o ne vienas klausimas ir atsakymas).

"
