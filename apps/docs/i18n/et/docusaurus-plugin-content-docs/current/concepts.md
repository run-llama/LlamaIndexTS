---
sidebar_position: 3
---

# Kõrgtasemel kontseptsioonid

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

LlamaIndex.TS aitab teil luua LLM-toega rakendusi (nt küsimuste ja vastuste süsteem, vestlusrobot) kohandatud andmete põhjal.

Selles kõrgtasemel kontseptsioonide juhendis saate teada:

- kuidas LLM saab vastata küsimustele teie enda andmete abil.
- olulised kontseptsioonid ja moodulid LlamaIndex.TS-s, et koostada oma päringute ahel.

## Küsimustele vastamine teie andmete põhjal

LlamaIndex kasutab LLM-i kasutades kaheastmelist meetodit teie andmetega:

1. **indekseerimisetapp**: teadmiste baasi ettevalmistamine ja
2. **päringuetapp**: asjakohase konteksti saamine teadmistest, et aidata LLM-il vastata küsimusele

![](./_static/concepts/rag.jpg)

Seda protsessi tuntakse ka kui Retrieval Augmented Generation (RAG).

LlamaIndex.TS pakub hädavajalikku tööriistakomplekti, et mõlemad etapid oleksid väga lihtsad.

Uurime nüüd iga etappi üksikasjalikumalt.

### Indekseerimisetapp

LlamaIndex.TS aitab teil teadmiste baasi ette valmistada andmekonnektorite ja indeksite komplektiga.

![](./_static/concepts/indexing.jpg)

[**Andmekoormuse laadijad**](./modules/high_level/data_loader.md):
Andmekonnektor (nt `Reader`) võtab vastu andmeid erinevatest andmeallikatest ja andmevormingutest ning esitab need lihtsa `Dokumendi` esinduse kujul (tekst ja lihtne metaandmed).

[**Dokumendid / Sõlmed**](./modules/high_level/documents_and_nodes.md): `Dokument` on üldine konteiner mis tahes andmeallika ümber - näiteks PDF, API väljund või andmed andmebaasist. `Sõlm` on LlamaIndexis andme aatomüksus ja esindab allika `Dokumendi` "tükki". See on rikas esindus, mis sisaldab metaandmeid ja suhteid (teiste sõlmedega), et võimaldada täpseid ja väljendusrikkaid taastamistoiminguid.

[**Andmeindeksid**](./modules/high_level/data_index.md):
Kui olete oma andmed vastu võtnud, aitab LlamaIndex teil andmed indekseerida kergesti taastatavasse vormingusse.

LlamaIndex töötleb sisuliselt toorete dokumentide vahepealseid esindusi, arvutab vektorite kinnistusi ja salvestab teie andmed mällu või kettale.

"

### Päringuetapp

Päringuetapis toob päringute ahel kasutaja päringu põhjal kõige asjakohasema konteksti
ja edastab selle LLM-ile (koos päringuga), et sünteesida vastus.

See annab LLM-ile ajakohaseid teadmisi, mis pole tema algse koolituse andmetes,
(vähendades ka hallutsinatsiooni).

Päringuetapi peamine väljakutse seisneb teadmiste otsimises, orkestreerimises ja järeldamises (võimalik, et mitme) teadmiste baasi üle.

LlamaIndex pakub koostatavaid mooduleid, mis aitavad teil luua ja integreerida RAG-päringute ahelaid küsimuste ja vastuste (päringumootor), vestlusroboti (vestlusmootor) või agendi osana.

Neid ehitusplokke saab kohandada, et kajastada paremusjärjestuse eelistusi, samuti koostada struktureeritud viisil järeldusi mitme teadmiste baasi üle.

![](./_static/concepts/querying.jpg)

#### Ehitusplokid

[**Otsijad**](./modules/low_level/retriever.md):
Otsija määratleb, kuidas tõhusalt saada asjakohast konteksti teadmistebaasist (st indeksist) päringu põhjal.
Konkreetne otsinguloogika erineb erinevate indeksite puhul, kõige populaarsem neist on tiheda otsingu kasutamine vektorindeksi vastu.

[**Vastuse sünteesijad**](./modules/low_level/response_synthesizer.md):
Vastuse sünteesija genereerib vastuse LLM-ist, kasutades kasutaja päringut ja antud hulka saadud tekstilõike.

"

#### Ahelad

[**Päringumootorid**](./modules/high_level/query_engine.md):
Päringumootor on lõpuni viidud ahel, mis võimaldab teil esitada küsimusi oma andmete kohta.
See võtab vastu loomuliku keele päringu ja tagastab vastuse koos tagastatud kontekstiga, mis edastatakse LLM-ile.

[**Vestlusmootorid**](./modules/high_level/chat_engine.md):
Vestlusmootor on lõpuni viidud ahel, mis võimaldab teil oma andmetega vestlust pidada
(mitte üksik küsimus ja vastus, vaid mitu edasi-tagasi).

"
