# Osnovni moduli

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

LlamaIndex.TS ponuja več osnovnih modulov, razdeljenih na visokonivojske module za hitro začetek in nizkonivojske module za prilagajanje ključnih komponent po potrebi.

## Visokonivojski moduli

- [**Dokument**](./high_level/documents_and_nodes.md): Dokument predstavlja besedilno datoteko, datoteko PDF ali drug kos podatkov.

- [**Voziček**](./high_level/documents_and_nodes.md): Osnovni gradnik podatkov. Najpogosteje so to deli dokumenta, razdeljeni na obvladljive kose, ki so dovolj majhni, da jih lahko vstavimo v model vdelave in LLM.

- [**Branilec/Nalagalnik**](./high_level/data_loader.md): Branilec ali nalagalnik je nekaj, kar sprejme dokument v resničnem svetu in ga pretvori v razred Dokument, ki ga lahko uporabite v svojem indeksu in poizvedbah. Trenutno podpiramo datoteke s čistim besedilom in PDF-je z mnogo večimi.

- [**Indeksi**](./high_level/data_index.md): indeksi shranjujejo vozlišča in vdelave teh vozlišč.

- [**Poizvedovalni motor**](./high_level/query_engine.md): Poizvedovalni motorji generirajo poizvedbo, ki jo vnesete, in vam vrnejo rezultat. Poizvedovalni motorji običajno združujejo predhodno pripravljen namig s izbranimi vozlišči iz vašega indeksa, da LLM zagotovijo kontekst, ki ga potrebuje za odgovor na vašo poizvedbo.

- [**Klepetalni motor**](./high_level/chat_engine.md): Klepetalni motor vam pomaga zgraditi klepetalnega robota, ki bo interaktiven z vašimi indeksi.

## Nizkonivojski modul

- [**LLM**](./low_level/llm.md): Razred LLM je združen vmesnik nad ponudnikom velikega jezikovnega modela, kot je OpenAI GPT-4, Anthropic Claude ali Meta LLaMA. Lahko ga podrazredite, da napišete povezavo do lastnega velikega jezikovnega modela.

- [**Vdelava**](./low_level/embedding.md): Vdelava je predstavljena kot vektor plavajočih števil. OpenAI-jev model vdelave besedil-ada-002 je naš privzeti model vdelave, vsaka vdelava, ki jo ustvari, pa vsebuje 1.536 plavajočih števil. Drug priljubljen model vdelave je BERT, ki uporablja 768 plavajočih števil za predstavitev vsakega vozlišča. Ponujamo več orodij za delo z vdelavami, vključno z 3 možnostmi za izračun podobnosti in največjo mejno relevantnostjo.

- [**RazdeljevalecBesedila/ParserVozlišč**](./low_level/node_parser.md): Strategije razdeljevanja besedila so izjemno pomembne za celovitost iskanja vdelav. Trenutno imamo privzeto rešitev, vendar ni univerzalne rešitve, ki bi ustrezala vsem. Odvisno od izvornih dokumentov morda želite uporabiti različne velikosti in strategije razdeljevanja. Trenutno podpiramo razdeljevanje po fiksnih velikostih, razdeljevanje po fiksnih velikostih z prekrivajočimi se odseki, razdeljevanje po stavkih in razdeljevanje po odstavkih. Razdeljevalec besedila se uporablja pri razdeljevanju `Dokumentov` v `Vozlišča` s strani ParserjaVozlišč.

- [**Pridobitelj**](./low_level/retriever.md): Pridobitelj je tisti, ki dejansko izbere vozlišča za pridobitev iz indeksa. Tu lahko poskusite pridobiti več ali manj vozlišč na poizvedbo, spremeniti funkcijo podobnosti ali ustvariti lasten pridobitelj za vsak posamezen primer uporabe v vaši aplikaciji. Na primer, morda želite imeti ločen pridobitelj za vsebino kode in besedilno vsebino.

- [**SintetizatorOdgovora**](./low_level/response_synthesizer.md): SintetizatorOdgovora je odgovoren za sprejemanje poizvedbenega niza in uporabo seznama `Vozlišč` za generiranje odgovora. To lahko zavzame različne oblike, kot je iteriranje po vsem kontekstu in izpopolnjevanje odgovora ali gradnja drevesa povzetkov in vračanje korena povzetka.

- [**Shramba**](./low_level/storage.md): Prej ali slej boste želeli shraniti svoje indekse, podatke in vektorje namesto ponovnega zagona modelov vdelave vsakič. IndexStore, DocStore, VectorStore in KVStore so abstrakcije, ki vam to omogočajo. Skupaj tvorijo StorageContext. Trenutno vam omogočamo, da trajno shranite svoje vdelave v datoteke na datotečnem sistemu (ali navideznem pomnilniškem datotečnem sistemu), vendar aktivno dodajamo tudi integracije z vektorskimi bazami podatkov.

"
