# Osnovni Moduli

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

LlamaIndex.TS nudi nekoliko osnovnih modula, koji su podeljeni na visokonivne module za brzi početak i niskonivne module za prilagođavanje ključnih komponenti prema potrebi.

## Visokog Nivoa Moduli

- [**Dokument**](./high_level/documents_and_nodes.md): Dokument predstavlja tekstualni fajl, PDF fajl ili drugi kontinuirani deo podataka.

- [**Čvor**](./high_level/documents_and_nodes.md): Osnovna građevinska jedinica podataka. Najčešće, ovo su delovi dokumenta podeljeni na upravljive delove koji su dovoljno mali da se mogu koristiti u modelu za ugradnju i LLM.

- [**Čitač/Učitavač**](./high_level/data_loader.md): Čitač ili učitavač je nešto što uzima dokument u stvarnom svetu i pretvara ga u klasu Dokumenta koja se može koristiti u vašem Indeksu i upitima. Trenutno podržavamo obične tekstualne fajlove i PDF-ove, a uskoro će biti podržano još mnogo formata.

- [**Indeksi**](./high_level/data_index.md): Indeksi čuvaju Čvorove i ugradnje tih čvorova.

- [**Upitni Motor**](./high_level/query_engine.md): Upitni motori generišu upit koji ste uneli i vraćaju vam rezultat. Upitni motori obično kombinuju unapred izgrađenu poruku sa odabranim čvorovima iz vašeg Indeksa kako bi LLM pružio kontekst koji mu je potreban da odgovori na vaš upit.

- [**Čet Motor**](./high_level/chat_engine.md): Čet motor vam pomaže da izgradite čet bota koji će komunicirati sa vašim Indeksima.

## Niskonivni Modul

- [**LLM**](./low_level/llm.md): Klasa LLM je ujedinjeni interfejs za veliki provajder jezičkog modela kao što su OpenAI GPT-4, Anthropic Claude ili Meta LLaMA. Možete je naslediti kako biste napisali konektor za sopstveni veliki jezički model.

- [**Embedding**](./low_level/embedding.md): Embedding je predstavljen kao vektor decimalnih brojeva. OpenAI-jev model text-embedding-ada-002 je naš podrazumevani embedding model, a svaki generisani embedding se sastoji od 1.536 decimalnih brojeva. Još jedan popularan embedding model je BERT koji koristi 768 decimalnih brojeva za predstavljanje svakog čvora. Pružamo nekoliko alata za rad sa embedding-om, uključujući 3 opcije za računanje sličnosti i Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategije deljenja teksta su izuzetno važne za ukupnu efikasnost pretrage embedding-a. Trenutno, iako imamo podrazumevano podešavanje, ne postoji univerzalno rešenje. Zavisno od izvornih dokumenata, možda ćete želeti da koristite različite veličine i strategije deljenja. Trenutno podržavamo deljenje po fiksnim veličinama, deljenje po fiksnim veličinama sa preklapajućim sekcijama, deljenje po rečenici i deljenje po pasusu. Text splitter se koristi od strane NodeParser-a prilikom deljenja `Dokumenata` na `Čvorove`.

- [**Retriever**](./low_level/retriever.md): Retriever je ono što zapravo bira Čvorove koje treba povratiti iz indeksa. Ovde možete pokušati da povratite više ili manje Čvorova po upitu, promeniti funkciju sličnosti ili kreirati sopstveni retriever za svaki pojedinačni slučaj upotrebe u vašoj aplikaciji. Na primer, možda ćete želeti da imate poseban retriever za sadržaj koda naspram tekstualnog sadržaja.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer je odgovoran za uzimanje upita i korišćenje liste `Čvorova` za generisanje odgovora. To može imati različite oblike, kao što je iteriranje kroz sav kontekst i usavršavanje odgovora, ili izgradnja stabla sažetaka i vraćanje korena sažetka.

- [**Storage**](./low_level/storage.md): U nekom trenutku ćete želeti da sačuvate svoje indekse, podatke i vektore umesto da ponovo pokrećete modele embedding-a svaki put. IndexStore, DocStore, VectorStore i KVStore su apstrakcije koje vam to omogućavaju. Kombinovano, oni čine StorageContext. Trenutno vam omogućavamo da trajno čuvate svoje embedding-e u datotekama na fajl sistemu (ili virtuelnom fajl sistemu u memoriji), ali takođe aktivno dodajemo integracije sa Vector bazama podataka.
