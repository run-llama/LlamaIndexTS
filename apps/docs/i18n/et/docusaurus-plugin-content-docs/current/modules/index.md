# Põhimoodulid

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

LlamaIndex.TS pakub mitmeid põhimooduleid, mis on jaotatud kõrgtasemel mooduliteks kiireks alustamiseks ja madalatasemelisteks mooduliteks, et kohandada olulisi komponente vastavalt vajadusele.

## Kõrgtasemel moodulid

- [**Dokument**](./high_level/documents_and_nodes.md): Dokument esindab tekstifaili, PDF-faili või muud järjestikust andmeplokki.

- [**Sõlm**](./high_level/documents_and_nodes.md): Põhiline andmete ehitusplokk. Enamasti on need dokumendi osad, mis on jagatud haldatavateks tükkideks, mis on piisavalt väikesed, et neid saaks sööta manustamismudelisse ja LLM-i.

- [**Lugeja/Laadur**](./high_level/data_loader.md): Lugeja või laadur on midagi, mis võtab reaalses maailmas dokumendi vastu ja muudab selle dokumendi klassiks, mida saab seejärel kasutada teie indeksis ja päringutes. Hetkel toetame lihttekstifaile ja PDF-e ning tulevikus lisandub veel palju rohkem.

- [**Indeksid**](./high_level/data_index.md): Indeksid salvestavad sõlmed ja nende sõlmede manustamised.

- [**Päringumootor**](./high_level/query_engine.md): Päringumootorid genereerivad päringu, mille sisestate, ja annavad teile tulemuse. Päringumootorid ühendavad üldiselt eelnevalt loodud vihje valitud sõlmedega teie indeksist, et anda LLM-ile vajalik kontekst teie päringu vastamiseks.

- [**Vestlusmootor**](./high_level/chat_engine.md): Vestlusmootor aitab teil luua vestlusroboti, mis suhtleb teie indeksitega.

## Madalatasemeline moodul

- [**LLM**](./low_level/llm.md): LLM klass on ühtne liides suure keelemudeli pakkujale, nagu näiteks OpenAI GPT-4, Anthropic Claude või Meta LLaMA. Seda saab alamklassina kasutada oma suure keelemudeli ühenduse kirjutamiseks.

- [**Embedding**](./low_level/embedding.md): Embedding (sisseehitatud) esitatakse ujuvkomaarvude vektorina. OpenAI teksti sisseehitatud ada-002 on meie vaike sisseehitatud mudel ja iga sisseehitatud mudel koosneb 1536 ujuvkomaarvust. Teine populaarne sisseehitatud mudel on BERT, mis kasutab iga sõlme esitamiseks 768 ujuvkomaarvu. Pakume mitmeid tööriistu sisseehitatud mudelitega töötamiseks, sealhulgas 3 sarnasuse arvutamise võimalust ja maksimaalset marginaalset asjakohasust.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Teksti jagamise strateegiad on sisseehitatud otsingu üldise tõhususe jaoks äärmiselt olulised. Praegu on meil vaikeväärtus, kuid ühtset lahendust pole. Sõltuvalt lähteandmetest võite soovida kasutada erineva suurusega jagamist ja strateegiaid. Praegu toetame jagamist fikseeritud suurusega, jagamist fikseeritud suurusega kattuvate osadega, jagamist lause järgi ja jagamist lõigu järgi. Teksti jagaja kasutatakse NodeParseri poolt, kui jagatakse `Dokumente` `Sõlmedeks`.

- [**Retriever**](./low_level/retriever.md): Retriever valib tegelikult sõlmed, mida taastada indeksist. Siin võite soovida proovida rohkem või vähem sõlmi päringu kohta, muuta sarnasusfunktsiooni või luua oma taastaja igaks individuaalseks kasutusjuhuks oma rakenduses. Näiteks võite soovida eraldi taastajat koodisisu ja tekstisisu jaoks.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer vastutab päringu stringi võtmise ja `Sõlmede` loendi kasutamise eest vastuse genereerimiseks. See võib võtta mitmeid vorme, näiteks kõigi konteksti üle iteratsioon ja vastuse täpsustamine või kokkuvõtete puu loomine ja juurkokkuvõtte tagastamine.

- [**Storage**](./low_level/storage.md): Varem või hiljem soovite oma indeksid, andmed ja vektorid salvestada, et mitte iga kord käivitada sisseehitatud mudeleid. IndexStore, DocStore, VectorStore ja KVStore on abstraktsioonid, mis võimaldavad seda teha. Koos moodustavad nad StorageContexti. Praegu lubame sisseehitatud mudelite püsivust failides failisüsteemis (või virtuaalses mälufailisüsteemis), kuid lisame aktiivselt ka integreerimisi vektorandmebaasidega.
