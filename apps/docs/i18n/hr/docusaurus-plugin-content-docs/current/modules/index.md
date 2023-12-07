# Osnovni moduli

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

LlamaIndex.TS nudi nekoliko osnovnih modula, podijeljenih na visokorazinske module za brzi početak i niskorazinske module za prilagodbu ključnih komponenti prema potrebi.

## Visokorazinski moduli

- [**Dokument**](./high_level/documents_and_nodes.md): Dokument predstavlja tekstualnu datoteku, PDF datoteku ili drugi kontinuirani dio podataka.

- [**Čvor**](./high_level/documents_and_nodes.md): Osnovna građevna jedinica podataka. Najčešće su to dijelovi dokumenta podijeljeni na upravljive dijelove koji su dovoljno mali da se mogu koristiti ugrađenom modelu i LLM.

- [**Čitač/Učitavač**](./high_level/data_loader.md): Čitač ili učitavač je nešto što uzima dokument u stvarnom svijetu i pretvara ga u klasu Dokument koja se može koristiti u vašem Indeksu i upitima. Trenutno podržavamo obične tekstualne datoteke i PDF-ove, a uskoro će biti podržano još mnogo više formata.

- [**Indeksi**](./high_level/data_index.md): Indeksi pohranjuju Čvorove i ugrađivanja tih čvorova.

- [**QueryEngine**](./high_level/query_engine.md): Query engine generira upit koji ste unijeli i vraća vam rezultat. Query engine obično kombinira unaprijed izgrađenu uputu s odabranim čvorovima iz vašeg Indeksa kako bi LLM pružio kontekst koji mu je potreban za odgovor na vaš upit.

- [**ChatEngine**](./high_level/chat_engine.md): ChatEngine vam pomaže izgraditi chatbota koji će komunicirati s vašim Indeksima.

## Niskorazinski modul

- [**LLM**](./low_level/llm.md): Klasa LLM je ujedinjeni sučelje za veliki dobavljač jezičnih modela kao što su OpenAI GPT-4, Anthropic Claude ili Meta LLaMA. Možete je naslijediti kako biste napisali konektor za vlastiti veliki jezični model.

- [**Ugrađivanje**](./low_level/embedding.md): Ugrađivanje je predstavljeno kao vektor decimalnih brojeva s pomičnim zarezom. OpenAI-jev model ugrađivanja teksta ada-002 je naš zadani model ugrađivanja, a svako ugrađivanje koje generira sastoji se od 1.536 decimalnih brojeva s pomičnim zarezom. Još jedan popularan model ugrađivanja je BERT koji koristi 768 decimalnih brojeva s pomičnim zarezom za prikaz svakog čvora. Pružamo nekoliko alata za rad s ugrađivanjima, uključujući 3 opcije za izračunavanje sličnosti i maksimalnu marginalnu relevantnost.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategije razdvajanja teksta izuzetno su važne za ukupnu učinkovitost pretraživanja ugrađivanja. Trenutno, iako imamo zadano rješenje, ne postoji univerzalno rješenje koje odgovara svima. Ovisno o izvornim dokumentima, možda ćete htjeti koristiti različite veličine i strategije razdvajanja. Trenutno podržavamo razdvajanje po fiksnoj veličini, razdvajanje po fiksnoj veličini s preklapajućim sekcijama, razdvajanje po rečenici i razdvajanje po odlomku. TextSplitter se koristi od strane NodeParsera prilikom razdvajanja `Dokumenata` u `Čvorove`.

- [**Retriever**](./low_level/retriever.md): Retriever je ono što zapravo odabire Čvorove za dohvat iz indeksa. Ovdje možete isprobati dohvaćanje više ili manje Čvorova po upitu, promijeniti funkciju sličnosti ili stvoriti vlastiti retriever za svaki pojedinačni slučaj upotrebe u vašoj aplikaciji. Na primjer, možda ćete željeti imati zaseban retriever za sadržaj koda i tekstualni sadržaj.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer je odgovoran za uzimanje niza upita i korištenje liste `Čvorova` za generiranje odgovora. To može imati različite oblike, poput iteriranja kroz sav kontekst i poboljšavanja odgovora ili izgradnje stabla sažetaka i vraćanja korijena sažetka.

- [**Storage**](./low_level/storage.md): U nekom trenutku ćete htjeti pohraniti svoje indekse, podatke i vektore umjesto ponovnog pokretanja modela ugrađivanja svaki put. IndexStore, DocStore, VectorStore i KVStore su apstrakcije koje vam to omogućuju. Kombinirano, oni čine StorageContext. Trenutno vam omogućujemo da trajno pohranite svoja ugrađivanja u datotekama na datotečnom sustavu (ili virtualnom memorijskom datotečnom sustavu), ali također aktivno dodajemo integracije s vektorskim bazama podataka.
